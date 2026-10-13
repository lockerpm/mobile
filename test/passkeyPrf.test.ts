// eslint-disable-next-line no-restricted-imports
import { Platform } from "react-native"

import { PasswordlessCredentialResponse } from "app/static/types"
import { KdfType } from "core/enums/kdfType"
import { Utils } from "core/misc/utils"

import {
  PASSKEY_RP_ID,
  buildPrfCreateRequest,
  buildPrfGetRequest,
  decodeAnyB64,
  findPasskeyByCredentialId,
  getPasskeyKdfConfig,
  getPreviousPrfRandom,
  getPrfUnlockCandidates,
  isPrfPasskeySupported,
  parsePrfCreateResult,
  parsePrfGetResult,
  toPasskeyItems,
} from "../app/utils/passkeyPrf"

jest.mock("react-native-passkey", () => ({
  Passkey: { isSupported: jest.fn(() => true) },
}))

let mockOS = "ios"
let mockVersion: string | number = "18.0"
Object.defineProperty(Platform, "OS", { configurable: true, get: () => mockOS })
Object.defineProperty(Platform, "Version", { configurable: true, get: () => mockVersion })

const bytes = (length: number, start = 0) =>
  Uint8Array.from({ length }, (_, i) => (start + i) % 256)
const b64 = (value: Uint8Array) => Buffer.from(value).toString("base64")
const b64Url = (value: Uint8Array) => Buffer.from(value).toString("base64url")

const SALT = bytes(32, 200)
const CHALLENGE = bytes(16, 7)
const CREDENTIAL_ID = bytes(20, 250)
const PRF_OUTPUT = bytes(32, 100)

const createParams = {
  userId: "1791799087000.user@locker.io",
  email: "user@locker.io",
  displayName: "User",
  challenge: CHALLENGE,
  salt: SALT,
}

const backupKey = (id: string, random: string, type: "prf" | "hmac" = "prf") => ({
  id,
  credential_id: `cred-${id}`,
  random,
  transports: ["hybrid", "internal"],
  name: `Passkey ${id}`,
  type,
  creation_date: 1791799020.0,
  last_use_date: null,
  kdf_version: 1,
  kdf: KdfType.ARGON2ID,
  kdf_iterations: 3,
  kdf_memory: 65536,
  kdf_parallelism: 4,
})

const credentialResponse = (
  overrides: Partial<PasswordlessCredentialResponse> = {}
): PasswordlessCredentialResponse => ({
  credential_id: null,
  random: null,
  transports: [],
  name: null,
  type: "hmac",
  creation_date: null,
  last_use_date: null,
  kdf_version: 1,
  kdf: KdfType.ARGON2ID,
  kdf_iterations: 3,
  kdf_memory: 65536,
  kdf_parallelism: 4,
  backup_keys: [],
  ...overrides,
})

beforeEach(() => {
  mockOS = "ios"
  mockVersion = "18.0"
})

describe("decodeAnyB64", () => {
  it("decodes standard base64 and unpadded base64url to the same bytes", () => {
    const value = bytes(33, 240)
    expect(Array.from(decodeAnyB64(b64(value)))).toEqual(Array.from(value))
    expect(Array.from(decodeAnyB64(b64Url(value)))).toEqual(Array.from(value))
  })
})

describe("buildPrfCreateRequest", () => {
  it("encodes the request for iOS", () => {
    const request = buildPrfCreateRequest(createParams)

    expect(request.rp).toEqual({ id: PASSKEY_RP_ID, name: "Locker" })
    expect(request.challenge).toBe(b64Url(CHALLENGE))
    // iOS reads user.id as raw UTF-8
    expect(request.user).toEqual({
      id: createParams.userId,
      name: createParams.email,
      displayName: createParams.displayName,
    })
    expect(request.pubKeyCredParams.map((p) => p.alg)).toEqual([-7, -257])
    expect(request.authenticatorSelection).toMatchObject({
      authenticatorAttachment: "platform",
      residentKey: "required",
      userVerification: "required",
    })
    // iOS decodes the salt from the JSON form of a Uint8Array
    const serialized = JSON.parse(JSON.stringify(request))
    expect(serialized.extensions.prf.eval.first).toEqual(Object.assign({}, Array.from(SALT)))
  })

  it("encodes the request for Android", () => {
    mockOS = "android"
    const request = buildPrfCreateRequest(createParams)

    expect(request.challenge).toBe(b64Url(CHALLENGE))
    expect(request.user.id).toBe(b64Url(Utils.fromUtf8ToArray(createParams.userId)))
    expect(request.extensions?.prf?.eval?.first).toBe(b64Url(SALT))
  })
})

describe("buildPrfGetRequest", () => {
  it("encodes the PRF salt per platform", () => {
    const params = {
      challenge: CHALLENGE,
      salt: SALT,
      allowCredentials: [{ idUrl: b64Url(CREDENTIAL_ID), transports: ["internal"] }],
    }

    const iosRequest = buildPrfGetRequest(params)
    expect(iosRequest.rpId).toBe(PASSKEY_RP_ID)
    expect(iosRequest.userVerification).toBe("required")
    expect(iosRequest.allowCredentials).toEqual([
      { type: "public-key", id: b64Url(CREDENTIAL_ID), transports: ["internal"] },
    ])
    expect(iosRequest.extensions?.prf?.eval?.first).toBe(SALT)

    mockOS = "android"
    expect(buildPrfGetRequest(params).extensions?.prf?.eval?.first).toBe(b64Url(SALT))
  })
})

describe("parsePrfCreateResult", () => {
  it("normalizes an iOS result (base64url id, standard base64 PRF output, no transports)", () => {
    const result = parsePrfCreateResult({
      id: b64Url(CREDENTIAL_ID),
      rawId: b64Url(CREDENTIAL_ID),
      response: { clientDataJSON: "", attestationObject: "" },
      clientExtensionResults: {
        prf: { enabled: true, results: { first: b64(PRF_OUTPUT) as any } },
      },
    })

    expect(result).toEqual({
      credentialId: b64(CREDENTIAL_ID),
      credentialIdUrl: b64Url(CREDENTIAL_ID),
      transports: ["hybrid", "internal"],
      prfEnabled: true,
      secret: b64(PRF_OUTPUT),
    })
  })

  it("normalizes an Android result (base64url everywhere, transports reported)", () => {
    const result = parsePrfCreateResult({
      id: b64Url(CREDENTIAL_ID),
      rawId: b64Url(CREDENTIAL_ID),
      response: { clientDataJSON: "", attestationObject: "", transports: ["internal"] } as any,
      clientExtensionResults: {
        prf: { enabled: true, results: { first: b64Url(PRF_OUTPUT) as any } },
      },
    })

    expect(result.credentialId).toBe(b64(CREDENTIAL_ID))
    expect(result.transports).toEqual(["internal"])
    expect(result.secret).toBe(b64(PRF_OUTPUT))
  })

  it("reports PRF enabled without output so the caller can fall back to an assertion", () => {
    const result = parsePrfCreateResult({
      id: b64Url(CREDENTIAL_ID),
      rawId: b64Url(CREDENTIAL_ID),
      response: { clientDataJSON: "", attestationObject: "" },
      clientExtensionResults: { prf: { enabled: true } },
    })
    expect(result.prfEnabled).toBe(true)
    expect(result.secret).toBeNull()
  })

  it("reports PRF unsupported when the extension is missing", () => {
    const result = parsePrfCreateResult({
      id: b64Url(CREDENTIAL_ID),
      rawId: b64Url(CREDENTIAL_ID),
      response: { clientDataJSON: "", attestationObject: "" },
    })
    expect(result.prfEnabled).toBe(false)
    expect(result.secret).toBeNull()
  })
})

describe("parsePrfGetResult", () => {
  it("accepts PRF output as a byte dictionary", () => {
    const result = parsePrfGetResult({
      id: b64Url(CREDENTIAL_ID),
      rawId: b64Url(CREDENTIAL_ID),
      response: { authenticatorData: "", clientDataJSON: "", signature: "", userHandle: "" },
      clientExtensionResults: {
        prf: { results: { first: Object.assign({}, Array.from(PRF_OUTPUT)) as any } },
      },
    })
    expect(result).toEqual({ credentialId: b64(CREDENTIAL_ID), secret: b64(PRF_OUTPUT) })
  })
})

describe("toPasskeyItems", () => {
  it("keeps PRF backup keys and appends the primary PRF credential with an empty id", () => {
    const items = toPasskeyItems(
      credentialResponse({
        type: "prf",
        credential_id: "primary-cred",
        random: "primary-random",
        name: "Primary",
        backup_keys: [backupKey("a", "r"), backupKey("b", "r", "hmac")],
      })
    )

    expect(items.map((i) => [i.id, i.isPrimary])).toEqual([
      ["a", false],
      ["", true],
    ])
    expect(items[1]).toMatchObject({ credentialId: "primary-cred", random: "primary-random" })
  })

  it("skips a primary hmac credential", () => {
    const items = toPasskeyItems(credentialResponse({ backup_keys: [backupKey("a", "r")] }))
    expect(items).toHaveLength(1)
    expect(items[0].isPrimary).toBe(false)
  })
})

describe("getPrfUnlockCandidates", () => {
  it("puts the primary PRF credential first and keeps each key's kdf config", () => {
    const candidates = getPrfUnlockCandidates(
      credentialResponse({
        type: "prf",
        credential_id: "primary-cred",
        random: "primary-random",
        kdf: KdfType.PBKDF2_SHA256,
        kdf_iterations: 100000,
        kdf_memory: null,
        kdf_parallelism: null,
        backup_keys: [backupKey("a", "r"), backupKey("b", "r", "hmac")],
      })
    )

    expect(candidates.map((c) => c.id)).toEqual(["", "a"])
    expect(candidates[0]).toMatchObject({ kdf: KdfType.PBKDF2_SHA256, kdfIterations: 100000 })
    expect(candidates[1]).toMatchObject({
      kdf: KdfType.ARGON2ID,
      kdfIterations: 3,
      kdfMemory: 65536,
      kdfParallelism: 4,
    })
  })
})

describe("findPasskeyByCredentialId", () => {
  it("matches a base64url credential id against the stored base64 id", () => {
    const items = toPasskeyItems(
      credentialResponse({
        backup_keys: [{ ...backupKey("a", "r"), credential_id: b64(CREDENTIAL_ID) }],
      })
    )
    expect(findPasskeyByCredentialId(items, b64Url(CREDENTIAL_ID))?.id).toBe("a")
    expect(findPasskeyByCredentialId(items, b64Url(bytes(20, 1)))).toBeUndefined()
  })
})

describe("getPreviousPrfRandom", () => {
  it("prefers the primary PRF random", () => {
    const data = credentialResponse({
      type: "prf",
      credential_id: "primary-cred",
      random: "primary-random",
      backup_keys: [backupKey("a", "backup-random")],
    })
    expect(getPreviousPrfRandom(data)).toBe("primary-random")
  })

  it("falls back to the last PRF backup key random", () => {
    const data = credentialResponse({
      backup_keys: [
        backupKey("a", "first"),
        backupKey("b", "last"),
        backupKey("c", "hmac", "hmac"),
      ],
    })
    expect(getPreviousPrfRandom(data)).toBe("last")
  })

  it("returns undefined when there is no PRF passkey", () => {
    expect(getPreviousPrfRandom(credentialResponse())).toBeUndefined()
  })
})

describe("getPasskeyKdfConfig", () => {
  it("uses PBKDF2 for legacy kdf versions", () => {
    expect(
      getPasskeyKdfConfig({ kdf: KdfType.ARGON2ID, kdf_iterations: 3, kdf_version: 0 })
    ).toEqual({
      kdf: KdfType.PBKDF2_SHA256,
      kdfIterations: 100000,
      kdfMemory: null,
      kdfParallelism: null,
    })
  })

  it("uses the server config otherwise", () => {
    expect(
      getPasskeyKdfConfig({
        kdf: KdfType.ARGON2ID,
        kdf_iterations: 3,
        kdf_memory: 65536,
        kdf_parallelism: 4,
        kdf_version: 1,
      })
    ).toEqual({
      kdf: KdfType.ARGON2ID,
      kdfIterations: 3,
      kdfMemory: 65536,
      kdfParallelism: 4,
    })
  })
})

describe("isPrfPasskeySupported", () => {
  it("requires iOS 18", () => {
    mockVersion = "17.5"
    expect(isPrfPasskeySupported()).toBe(false)
    mockVersion = "18.1"
    expect(isPrfPasskeySupported()).toBe(true)
  })
})
