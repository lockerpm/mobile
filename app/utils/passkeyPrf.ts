import { Platform } from "react-native"
import {
  Passkey,
  PasskeyCreateRequest,
  PasskeyCreateResult,
  PasskeyGetRequest,
  PasskeyGetResult,
} from "react-native-passkey"

import {
  MPEncodeConfig,
  PasskeyItem,
  PasswordlessBackupKey,
  PasswordlessCredentialResponse,
} from "app/static/types"
import { KdfType } from "core/enums/kdfType"
import { Utils } from "core/misc/utils"

/**
 * Passkey with PRF extension used as a backup key to unlock the vault.
 * Must stay in sync with `@lockerpm/client-service` (usecases/passkey.ts) used by the web vault.
 *
 * react-native-passkey forwards requests differently per platform:
 * - iOS decodes `user.id` as raw UTF-8 and PRF salts as `{ "0": n, ... }` (JSON of a Uint8Array),
 *   and returns PRF results as standard base64.
 * - Android passes the JSON as-is to Credential Manager, which expects base64url everywhere.
 */

export const PASSKEY_RP_ID = "passwords.locker.io"
export const PASSKEY_RP_NAME = "Locker"
export const PRF_SALT_LENGTH = 32
export const PASSKEY_CHALLENGE_LENGTH = 16

// iOS doesn't report transports for platform credentials, use what Safari reports for iCloud Keychain
const DEFAULT_TRANSPORTS = ["hybrid", "internal"]

export enum PasskeyPrfErrorCode {
  NOT_SUPPORTED = "NOT_SUPPORTED",
  PRF_UNSUPPORTED = "PRF_UNSUPPORTED",
  NO_PRF_SECRET = "NO_PRF_SECRET",
  CANCELLED = "CANCELLED",
}

export class PasskeyPrfError extends Error {
  code: PasskeyPrfErrorCode

  constructor(code: PasskeyPrfErrorCode) {
    super(code)
    this.code = code
  }
}

const isIos = () => Platform.OS === "ios"

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer

const toB64 = (bytes: Uint8Array) => Utils.fromBufferToB64(toArrayBuffer(bytes))

const toUrlB64 = (bytes: Uint8Array) => Utils.fromBufferToUrlB64(toArrayBuffer(bytes))

/**
 * Accepts both base64 and base64url (padded or not)
 */
export const decodeAnyB64 = (value: string): Uint8Array => Utils.fromUrlB64ToArray(value)

const decodePrfValue = (value: unknown): Uint8Array | null => {
  if (!value) {
    return null
  }
  if (typeof value === "string") {
    return decodeAnyB64(value)
  }
  if (value instanceof Uint8Array) {
    return value
  }
  if (typeof value === "object") {
    // `{ "0": n, ... }` dictionary
    const entries = Object.entries(value as Record<string, number>).sort(
      ([a], [b]) => Number(a) - Number(b)
    )
    return Uint8Array.from(entries.map(([, n]) => n))
  }
  return null
}

const encodePrfSalt = (salt: Uint8Array) => {
  // The library types the salt as Uint8Array, Android needs a base64url string instead
  return (isIos() ? salt : toUrlB64(salt)) as Uint8Array
}

export const isPrfPasskeySupported = () => {
  if (isIos()) {
    // ASAuthorizationPublicKeyCredentialPRFRegistrationInput is iOS 18+
    return parseInt(String(Platform.Version), 10) >= 18
  }
  return Passkey.isSupported()
}

export const isPasskeyCancelledError = (error: any) =>
  error?.error === "UserCancelled" || error?.code === "UserCancelled"

// ------------------------- LIST -------------------------

/**
 * Same as `listAllPasskeys` of the web service: PRF backup keys, then the primary credential (id = "")
 */
export const toPasskeyItems = (data: PasswordlessCredentialResponse): PasskeyItem[] => {
  const { backup_keys: backupKeys = [], ...primary } = data
  const toKdf = (k: PasswordlessCredentialResponse | PasswordlessBackupKey) => ({
    kdfVersion: k.kdf_version,
    kdf: k.kdf,
    kdfIterations: k.kdf_iterations,
    kdfMemory: k.kdf_memory,
    kdfParallelism: k.kdf_parallelism,
  })

  const items: PasskeyItem[] = backupKeys
    .filter((k) => k.type === "prf")
    .map((k) => ({
      id: k.id,
      name: k.name,
      credentialId: k.credential_id,
      random: k.random,
      transports: k.transports ?? [],
      creationDate: k.creation_date,
      lastUseDate: k.last_use_date,
      isPrimary: false,
      ...toKdf(k),
    }))

  if (primary.type === "prf" && primary.credential_id && primary.random) {
    items.push({
      id: "",
      name: primary.name ?? "",
      credentialId: primary.credential_id,
      random: primary.random,
      transports: primary.transports ?? [],
      creationDate: primary.creation_date,
      lastUseDate: primary.last_use_date,
      isPrimary: true,
      ...toKdf(data),
    })
  }
  return items
}

/**
 * Same as `getPasswordlessUsingPasskeys` of the web service: primary credential first, then backup keys
 */
export const getPrfUnlockCandidates = (data: PasswordlessCredentialResponse): PasskeyItem[] => {
  const items = toPasskeyItems(data).filter((i) => i.credentialId && i.random)
  return [...items.filter((i) => i.isPrimary), ...items.filter((i) => !i.isPrimary)]
}

/**
 * Credential ids are stored as base64 by the server, compare them on their bytes
 */
export const findPasskeyByCredentialId = (items: PasskeyItem[], credentialId: string) => {
  const target = toUrlB64(decodeAnyB64(credentialId))
  return items.find((i) => toUrlB64(decodeAnyB64(i.credentialId)) === target)
}

/**
 * All PRF passkeys of an account share the same salt so they can be evaluated in a single request
 */
export const getPreviousPrfRandom = (data: PasswordlessCredentialResponse): string | undefined => {
  const { backup_keys: backupKeys = [], ...primary } = data
  if (primary.type === "prf" && primary.random) {
    return primary.random
  }
  let previousRandom: string | undefined
  backupKeys
    .filter((k) => k.type === "prf")
    .forEach((k) => {
      if (k.random) {
        previousRandom = k.random
      }
    })
  return previousRandom
}

/**
 * Accounts created before kdf_version 1 always use PBKDF2 for passkey keys
 */
export const getPasskeyKdfConfig = (config: MPEncodeConfig) => {
  if ((config.kdf_version ?? 0) < 1) {
    return {
      kdf: KdfType.PBKDF2_SHA256,
      kdfIterations: 100000,
      kdfMemory: null,
      kdfParallelism: null,
    }
  }
  return {
    kdf: config.kdf,
    kdfIterations: config.kdf_iterations,
    kdfMemory: config.kdf_memory ?? null,
    kdfParallelism: config.kdf_parallelism ?? null,
  }
}

// ------------------------- CREATE -------------------------

export const buildPrfCreateRequest = (params: {
  userId: string
  email: string
  displayName: string
  challenge: Uint8Array
  salt: Uint8Array
  rpId?: string
}): PasskeyCreateRequest => {
  const { userId, email, displayName, challenge, salt, rpId = PASSKEY_RP_ID } = params
  return {
    challenge: toUrlB64(challenge),
    rp: {
      id: rpId,
      name: PASSKEY_RP_NAME,
    },
    user: {
      id: isIos() ? userId : toUrlB64(Utils.fromUtf8ToArray(userId)),
      name: email,
      displayName,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      requireResidentKey: true,
      residentKey: "required",
      userVerification: "required",
    },
    attestation: "none",
    extensions: {
      prf: {
        eval: {
          first: encodePrfSalt(salt),
        },
      },
    },
  }
}

export const parsePrfCreateResult = (result: PasskeyCreateResult) => {
  const rawId = decodeAnyB64(result.rawId || result.id)
  const responseTransports: string[] | undefined = (result.response as any)?.transports
  const prf = result.clientExtensionResults?.prf
  const secret = decodePrfValue(prf?.results?.first)

  return {
    credentialId: toB64(rawId),
    credentialIdUrl: toUrlB64(rawId),
    transports: responseTransports?.length ? responseTransports : DEFAULT_TRANSPORTS,
    prfEnabled: !!prf?.enabled || !!secret,
    secret: secret ? toB64(secret) : null,
  }
}

// ------------------------- GET -------------------------

type CredentialDescriptor = NonNullable<PasskeyGetRequest["allowCredentials"]>[number]

export const buildPrfGetRequest = (params: {
  challenge: Uint8Array
  salt: Uint8Array
  allowCredentials: { idUrl: string; transports?: string[] }[]
  rpId?: string
}): PasskeyGetRequest => {
  const { challenge, salt, allowCredentials, rpId = PASSKEY_RP_ID } = params
  return {
    challenge: toUrlB64(challenge),
    rpId,
    allowCredentials: allowCredentials.map((c) => ({
      type: "public-key",
      id: c.idUrl,
      transports: c.transports as CredentialDescriptor["transports"],
    })),
    userVerification: "required",
    extensions: {
      prf: {
        eval: {
          first: encodePrfSalt(salt),
        },
      },
    },
  }
}

export const parsePrfGetResult = (result: PasskeyGetResult) => {
  const rawId = decodeAnyB64(result.rawId || result.id)
  const secret = decodePrfValue(result.clientExtensionResults?.prf?.results?.first)
  return {
    credentialId: toB64(rawId),
    secret: secret ? toB64(secret) : null,
  }
}
