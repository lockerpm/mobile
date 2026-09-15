import { Fido2Utils } from "core/misc/fido2/fido2-utils"
import { evaluatePrf, evaluatePrfAlreadyHashed } from "core/misc/fido2/prf"
import { Fido2CredentialView } from "core/models/view/fido2CredentialView"

import {
  createPrfClientExtensionResults,
  getPrfClientExtensionResults,
} from "../app/utils/autofill.android/fido2"
import {
  Fido2AuthenticatorError,
  Fido2AuthenticatorErrorCode,
} from "../core/abstractions/fido2Authenticator.service"

jest.mock("react-native-quick-crypto", () => {
  const forge = jest.requireActual<typeof import("node-forge")>("node-forge")
  const toBytes = (value: BufferSource) =>
    ArrayBuffer.isView(value)
      ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
      : new Uint8Array(value)
  const toBinary = (value: BufferSource) => String.fromCharCode(...Array.from(toBytes(value)))
  const toArrayBuffer = (value: string) =>
    Uint8Array.from(value, (character) => character.charCodeAt(0)).buffer

  const subtle = {
    async digest(_algorithm: string, data: BufferSource) {
      const hash = forge.md.sha256.create()
      hash.update(toBinary(data), "raw")
      return toArrayBuffer(hash.digest().getBytes())
    },
    async importKey(_format: string, keyData: BufferSource) {
      return { data: toBytes(keyData) }
    },
    async sign(_algorithm: string, key: { data: Uint8Array }, data: BufferSource) {
      const hmac = forge.hmac.create()
      hmac.start("sha256", toBinary(key.data))
      hmac.update(toBinary(data))
      return toArrayBuffer(hmac.digest().getBytes())
    },
  }

  return {
    __esModule: true,
    default: {
      getRandomValues(array: Uint8Array) {
        array.forEach((_, index) => {
          array[index] = index + 1
        })
        return array
      },
      subtle,
    },
  }
})

const testCrypto = jest.requireMock<{
  default: {
    subtle: {
      digest(algorithm: string, data: BufferSource): Promise<ArrayBuffer>
    }
  }
}>("react-native-quick-crypto").default

const encode = (value: string) => Fido2Utils.bufferToString(new TextEncoder().encode(value))
const encodeBytes = (value: BufferSource) => Fido2Utils.bufferToString(value)
const fixedPrfKey = Fido2Utils.bufferToString(Uint8Array.from({ length: 32 }, (_, i) => i))

async function hashPrfInput(value: string): Promise<Uint8Array> {
  const context = new TextEncoder().encode("WebAuthn PRF")
  const input = new TextEncoder().encode(value)
  const contextualizedInput = new Uint8Array(context.byteLength + 1 + input.byteLength)
  contextualizedInput.set(context)
  contextualizedInput.set(input, context.byteLength + 1)
  return new Uint8Array(await testCrypto.subtle.digest("SHA-256", contextualizedInput))
}

describe("WebAuthn PRF", () => {
  it("applies the WebAuthn PRF domain separation for first and second", async () => {
    const results = await evaluatePrf(Fido2Utils.stringToBuffer(fixedPrfKey), {
      first: new TextEncoder().encode("first-input"),
      second: new TextEncoder().encode("second-input"),
    })

    expect(Fido2Utils.bufferToString(results.first)).toBe(
      "gI0S_wvuytHC-yBGIPmz_xiXGX3amvKkEHZiuFxwOus"
    )
    expect(Fido2Utils.bufferToString(results.second!)).toBe(
      "YoSHSin0vHdeQXii5DTb9iPfq3XtGXTnUfzX-sSq_1w"
    )
  })

  it("does not hash Chromium prfAlreadyHashed inputs a second time", async () => {
    const first = await hashPrfInput("first-input")
    const second = await hashPrfInput("second-input")
    const results = await evaluatePrfAlreadyHashed(Fido2Utils.stringToBuffer(fixedPrfKey), {
      first,
      second,
    })

    expect(Fido2Utils.bufferToString(results.first)).toBe(
      "gI0S_wvuytHC-yBGIPmz_xiXGX3amvKkEHZiuFxwOus"
    )
    expect(Fido2Utils.bufferToString(results.second!)).toBe(
      "YoSHSin0vHdeQXii5DTb9iPfq3XtGXTnUfzX-sSq_1w"
    )
  })

  it("does not enable PRF when registration does not request it", async () => {
    const credential = new Fido2CredentialView()

    await expect(createPrfClientExtensionResults({}, credential)).resolves.toEqual({})
    expect(credential.prfKey).toBeNull()
  })

  it("creates a PRF key and registration results", async () => {
    const credential = new Fido2CredentialView()
    const request = {
      extensions: {
        prf: {
          eval: {
            first: encode("first-input"),
            second: encode("second-input"),
          },
        },
      },
    } as any

    const result = await createPrfClientExtensionResults(request, credential)

    expect(Fido2Utils.stringToBuffer(credential.prfKey!).byteLength).toBe(32)
    expect(result.prf?.enabled).toBe(true)
    expect(result.prf?.results?.first).toHaveLength(43)
    expect(result.prf?.results?.second).toHaveLength(43)
  })

  it("enables PRF during registration without requiring eval", async () => {
    const credential = new Fido2CredentialView()
    const request = { extensions: { prf: {} } } as any

    const result = await createPrfClientExtensionResults(request, credential)

    expect(Fido2Utils.stringToBuffer(credential.prfKey!).byteLength).toBe(32)
    expect(result).toEqual({ prf: { enabled: true } })
  })

  it("enables PRF for Chromium prfAlreadyHashed registration requests", async () => {
    const credential = new Fido2CredentialView()
    const request = { extensions: { prfAlreadyHashed: {} } } as any

    const result = await createPrfClientExtensionResults(request, credential)

    expect(Fido2Utils.stringToBuffer(credential.prfKey!).byteLength).toBe(32)
    expect(result).toEqual({ prf: { enabled: true } })
  })

  it("rejects evalByCredential during registration", async () => {
    const credential = new Fido2CredentialView()
    const request = {
      extensions: { prf: { evalByCredential: {} } },
    } as any

    await expect(createPrfClientExtensionResults(request, credential)).rejects.toMatchObject({
      errorCode: Fido2AuthenticatorErrorCode.NotSupported,
    })
    expect(credential.prfKey).toBeNull()
  })

  it("uses direct eval during authentication", async () => {
    const credential = new Fido2CredentialView()
    credential.prfKey = fixedPrfKey
    const rawCredentialId = encode("credential-id")
    const requestJson = JSON.stringify({
      extensions: { prf: { eval: { first: encode("first-input") } } },
    })

    const result = await getPrfClientExtensionResults(requestJson, credential, rawCredentialId)

    expect(result.prf?.results?.first).toBe("gI0S_wvuytHC-yBGIPmz_xiXGX3amvKkEHZiuFxwOus")
  })

  it("uses Chromium prfAlreadyHashed eval during authentication", async () => {
    const credential = new Fido2CredentialView()
    credential.prfKey = fixedPrfKey
    const rawCredentialId = encode("credential-id")
    const hashedInput = await hashPrfInput("first-input")
    const requestJson = JSON.stringify({
      extensions: {
        prfAlreadyHashed: { eval: { first: encodeBytes(hashedInput) } },
      },
    })

    const result = await getPrfClientExtensionResults(requestJson, credential, rawCredentialId)

    expect(result.prf?.results?.first).toBe("gI0S_wvuytHC-yBGIPmz_xiXGX3amvKkEHZiuFxwOus")
  })

  it("uses React Native Quick Crypto without global Web Crypto", async () => {
    const credential = new Fido2CredentialView()
    credential.prfKey = fixedPrfKey
    const rawCredentialId = encode("credential-id")
    const hashedInput = await hashPrfInput("first-input")
    const requestJson = JSON.stringify({
      extensions: {
        prfAlreadyHashed: { eval: { first: encodeBytes(hashedInput) } },
      },
    })
    const result = await getPrfClientExtensionResults(requestJson, credential, rawCredentialId)

    expect(result.prf?.results?.first).toBe("gI0S_wvuytHC-yBGIPmz_xiXGX3amvKkEHZiuFxwOus")
  })

  it("prefers matching evalByCredential and falls back to eval", async () => {
    const credential = new Fido2CredentialView()
    credential.prfKey = fixedPrfKey
    const rawCredentialId = encode("credential-id")
    const otherCredentialId = encode("other-credential")
    const baseRequest = {
      allowCredentials: [{ id: rawCredentialId, type: "public-key" }],
      extensions: {
        prf: {
          eval: { first: encode("first-input") },
        },
      },
    }

    const matching = await getPrfClientExtensionResults(
      JSON.stringify({
        ...baseRequest,
        extensions: {
          prf: {
            ...baseRequest.extensions.prf,
            evalByCredential: {
              [rawCredentialId]: { first: encode("second-input") },
            },
          },
        },
      }),
      credential,
      rawCredentialId
    )
    const fallback = await getPrfClientExtensionResults(
      JSON.stringify({
        ...baseRequest,
        allowCredentials: [
          { id: rawCredentialId, type: "public-key" },
          { id: otherCredentialId, type: "public-key" },
        ],
        extensions: {
          prf: {
            ...baseRequest.extensions.prf,
            evalByCredential: {
              [otherCredentialId]: { first: encode("second-input") },
            },
          },
        },
      }),
      credential,
      rawCredentialId
    )

    expect(matching.prf?.results?.first).toBe("YoSHSin0vHdeQXii5DTb9iPfq3XtGXTnUfzX-sSq_1w")
    expect(fallback.prf?.results?.first).toBe("gI0S_wvuytHC-yBGIPmz_xiXGX3amvKkEHZiuFxwOus")
  })

  it("returns an empty PRF output for legacy credentials", async () => {
    const credential = new Fido2CredentialView()
    const requestJson = JSON.stringify({
      extensions: { prf: { eval: { first: encode("first-input") } } },
    })

    await expect(
      getPrfClientExtensionResults(requestJson, credential, encode("credential-id"))
    ).resolves.toEqual({ prf: {} })
  })

  it("returns no extension output when authentication does not request PRF", async () => {
    const credential = new Fido2CredentialView()
    credential.prfKey = fixedPrfKey

    await expect(
      getPrfClientExtensionResults("{}", credential, encode("credential-id"))
    ).resolves.toEqual({})
  })

  it.each([
    {
      name: "malformed PRF value",
      request: {
        extensions: { prf: { eval: { first: "not+base64url" } } },
      },
    },
    {
      name: "prfAlreadyHashed value with wrong length",
      request: {
        extensions: { prfAlreadyHashed: { eval: { first: encode("not-32-bytes") } } },
      },
    },
    {
      name: "both prf input formats",
      request: {
        extensions: { prf: {}, prfAlreadyHashed: {} },
      },
    },
    {
      name: "evalByCredential without allowCredentials",
      request: {
        extensions: {
          prf: { evalByCredential: { [encode("credential-id")]: { first: "" } } },
        },
      },
    },
    {
      name: "evalByCredential key outside allowCredentials",
      request: {
        allowCredentials: [{ id: encode("credential-id"), type: "public-key" }],
        extensions: {
          prf: { evalByCredential: { [encode("other-credential")]: { first: "" } } },
        },
      },
    },
    {
      name: "malformed evalByCredential key",
      request: {
        allowCredentials: [{ id: encode("credential-id"), type: "public-key" }],
        extensions: {
          prf: { evalByCredential: { "not+base64url": { first: "" } } },
        },
      },
    },
  ])("rejects $name", async ({ request }) => {
    const credential = new Fido2CredentialView()
    credential.prfKey = fixedPrfKey

    await expect(
      getPrfClientExtensionResults(JSON.stringify(request), credential, encode("credential-id"))
    ).rejects.toBeInstanceOf(Fido2AuthenticatorError)
  })
})
