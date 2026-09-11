import crypto from "react-native-quick-crypto"

import { Utils } from "./common"
import { Fido2Utils } from "./fido2-utils"
import {
  Fido2AuthenticatorError,
  Fido2AuthenticatorErrorCode,
  Fido2PrfInputs,
  Fido2PrfResults,
  Fido2PrfValues,
  PublicKeyCredentialDescriptor,
} from "../../abstractions/fido2Authenticator.service"

const PRF_KEY_LENGTH = 32
const PRF_CONTEXT = Utils.fromUtf8ToArray("WebAuthn PRF")

export type PrfCryptoProvider = {
  randomBytes(length: number): Uint8Array<ArrayBuffer>
  sha256(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>>
  hmacSha256(
    key: Uint8Array<ArrayBuffer>,
    data: Uint8Array<ArrayBuffer>
  ): Promise<Uint8Array<ArrayBuffer>>
}

const quickCryptoPrfProvider: PrfCryptoProvider = {
  randomBytes(length) {
    return Uint8Array.from(crypto.getRandomValues(new Uint8Array(length)))
  },
  async sha256(data) {
    return new Uint8Array((await crypto.subtle.digest("SHA-256", data)) as ArrayBuffer)
  },
  async hmacSha256(key, data) {
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      key,
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    )
    return new Uint8Array(
      (await crypto.subtle.sign({ name: "HMAC" }, hmacKey, data)) as ArrayBuffer
    )
  },
}

export function generatePrfKey(
  cryptoProvider: Pick<PrfCryptoProvider, "randomBytes"> = quickCryptoPrfProvider
): Uint8Array<ArrayBuffer> {
  return cryptoProvider.randomBytes(PRF_KEY_LENGTH)
}

export async function evaluatePrf(
  prfKey: BufferSource,
  values: Fido2PrfValues,
  cryptoProvider: PrfCryptoProvider = quickCryptoPrfProvider
): Promise<Fido2PrfResults> {
  return evaluatePrfInputs(prfKey, values, false, cryptoProvider)
}

/**
 * Evaluates Chromium's private `prfAlreadyHashed` input. Each value is the
 * 32-byte SHA-256 digest of `"WebAuthn PRF" || 0x00 || input`, so it must be
 * passed directly to HMAC instead of applying PRF domain separation again.
 */
export async function evaluatePrfAlreadyHashed(
  prfKey: BufferSource,
  values: Fido2PrfValues,
  cryptoProvider: PrfCryptoProvider = quickCryptoPrfProvider
): Promise<Fido2PrfResults> {
  return evaluatePrfInputs(prfKey, values, true, cryptoProvider)
}

async function evaluatePrfInputs(
  prfKey: BufferSource,
  values: Fido2PrfValues,
  inputsAreHashed: boolean,
  cryptoProvider: PrfCryptoProvider
): Promise<Fido2PrfResults> {
  const hmacKey = Fido2Utils.bufferSourceToUint8Array(prfKey)

  const results: Fido2PrfResults = {
    first: await evaluatePrfValue(hmacKey, values.first, inputsAreHashed, cryptoProvider),
  }

  if (values.second != null) {
    results.second = await evaluatePrfValue(hmacKey, values.second, inputsAreHashed, cryptoProvider)
  }

  return results
}

export function validatePrfEvalByCredential(
  prfInputs: Fido2PrfInputs | undefined,
  allowCredentialDescriptorList?: PublicKeyCredentialDescriptor[]
): void {
  const evalByCredential = prfInputs?.evalByCredential
  if (!evalByCredential) {
    return
  }

  const credentialIds = Object.keys(evalByCredential)
  if (credentialIds.length === 0) {
    return
  }

  if (!allowCredentialDescriptorList?.length) {
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.NotSupported)
  }

  const allowedCredentialIds = new Set(
    allowCredentialDescriptorList.map((credential) => Fido2Utils.bufferToString(credential.id))
  )

  for (const credentialId of credentialIds) {
    if (!isCanonicalBase64Url(credentialId) || !allowedCredentialIds.has(credentialId)) {
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
    }
  }
}

export function getPrfValuesForCredential(
  prfInputs: Fido2PrfInputs,
  credentialId: BufferSource
): Fido2PrfValues | undefined {
  const encodedCredentialId = Fido2Utils.bufferToString(credentialId)
  return prfInputs.evalByCredential?.[encodedCredentialId] || prfInputs.eval
}

export function isCanonicalBase64Url(value: string): boolean {
  if (value.length === 0 || !/^[A-Za-z0-9_-]+$/.test(value)) {
    return false
  }

  try {
    return Fido2Utils.bufferToString(Fido2Utils.stringToBuffer(value)) === value
  } catch {
    return false
  }
}

async function evaluatePrfValue(
  prfKey: Uint8Array<ArrayBuffer>,
  input: BufferSource,
  inputIsHashed: boolean,
  cryptoProvider: PrfCryptoProvider
): Promise<Uint8Array<ArrayBuffer>> {
  const inputBytes = Fido2Utils.bufferSourceToUint8Array(input)
  if (inputIsHashed) {
    if (inputBytes.byteLength !== 32) {
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
    }

    return cryptoProvider.hmacSha256(prfKey, inputBytes)
  }

  const contextualizedInput = new Uint8Array(PRF_CONTEXT.length + 1 + inputBytes.length)
  contextualizedInput.set(PRF_CONTEXT)
  contextualizedInput.set(inputBytes, PRF_CONTEXT.length + 1)

  const salt = await cryptoProvider.sha256(contextualizedInput)
  return cryptoProvider.hmacSha256(prfKey, salt)
}
