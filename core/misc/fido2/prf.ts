import { Utils } from "./common"
import { Fido2Utils } from "./fido2-utils"
import { Fido2PrfResults, Fido2PrfValues } from "../../abstractions/fido2Authenticator.service"

const PRF_KEY_LENGTH = 32
const PRF_CONTEXT = Utils.fromUtf8ToArray("WebAuthn PRF")

export function generatePrfKey(): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(PRF_KEY_LENGTH))
}

export async function evaluatePrf(
  prfKey: BufferSource,
  values: Fido2PrfValues
): Promise<Fido2PrfResults> {
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    Fido2Utils.bufferSourceToUint8Array(prfKey),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  )

  const results: Fido2PrfResults = {
    first: await evaluatePrfValue(hmacKey, values.first),
  }

  if (values.second != null) {
    results.second = await evaluatePrfValue(hmacKey, values.second)
  }

  return results
}

async function evaluatePrfValue(prfKey: CryptoKey, input: BufferSource): Promise<Uint8Array> {
  const inputBytes = Fido2Utils.bufferSourceToUint8Array(input)
  const contextualizedInput = new Uint8Array(PRF_CONTEXT.length + 1 + inputBytes.length)
  contextualizedInput.set(PRF_CONTEXT)
  contextualizedInput.set(inputBytes, PRF_CONTEXT.length + 1)

  const salt = await crypto.subtle.digest("SHA-256", contextualizedInput)
  return new Uint8Array(await crypto.subtle.sign("HMAC", prfKey, salt))
}
