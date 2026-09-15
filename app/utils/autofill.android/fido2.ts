import { encode as btoa } from "base-64"
import crypto from "react-native-quick-crypto"
import type { CryptoKey, WebCryptoKeyPair } from "react-native-quick-crypto"

import {
  Fido2AuthenticatorError,
  Fido2AuthenticatorErrorCode,
  Fido2PrfInputs,
  Fido2PrfResults,
  Fido2PrfValues,
  PublicKeyCredentialDescriptor,
} from "core/abstractions/fido2Authenticator.service"
import { Utils } from "core/misc/fido2/common"
import { Fido2Utils } from "core/misc/fido2/fido2-utils"
import {
  evaluatePrf,
  evaluatePrfAlreadyHashed,
  generatePrfKey,
  getPrfValuesForCredential,
  validatePrfEvalByCredential,
} from "core/misc/fido2/prf"
import { Fido2CredentialView } from "core/models/view/fido2CredentialView"

export type AndroidClientExtensionResults = {
  prf?: {
    enabled?: boolean
    results?: {
      first: string
      second?: string
    }
  }
}

export const createFido2SimpleView = async (
  requestJson: string
): Promise<{
  fido2View: Fido2CredentialView
  publicKey: string
  clientExtensionResults: AndroidClientExtensionResults
}> => {
  const params: PublicKeyCredentialCreationOptionsJSON = JSON.parse(requestJson)

  // Generate a credential key pair
  const keyPair = (await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256", // secp256r1 is also known as P-256
    },
    true, // extractable
    ["sign", "verify"]
  )) as WebCryptoKeyPair

  // Extract public key
  const publicKey = keyPair.publicKey as CryptoKey
  const spkiKey = await crypto.subtle.exportKey("spki", publicKey)

  // Extract private key
  const privateKey = keyPair.privateKey as CryptoKey
  const pkcs8Key = await crypto.subtle.exportKey("pkcs8", privateKey)
  const privateKeyString = bufferToString(pkcs8Key as ArrayBuffer)

  const publicKeyString = bufferToString(spkiKey as ArrayBuffer)

  const fido2Credential = new Fido2CredentialView()
  fido2Credential.credentialId = Utils.newGuid()
  fido2Credential.keyType = "public-key"
  fido2Credential.keyAlgorithm = "ECDSA"
  fido2Credential.keyCurve = "P-256"
  fido2Credential.keyValue = privateKeyString
  fido2Credential.rpId = params.rp.id!
  fido2Credential.userHandle = params.user.id
  fido2Credential.userName = params.user.name!
  fido2Credential.counter = 0
  fido2Credential.rpName = params.rp.name
  fido2Credential.userDisplayName = params.user.displayName!
  fido2Credential.creationDate = new Date()

  const clientExtensionResults = await createPrfClientExtensionResults(params, fido2Credential)

  const result = {
    fido2View: fido2Credential,
    publicKey: publicKeyString,
    clientExtensionResults,
  }

  return result
}

export async function createPrfClientExtensionResults(
  request: Pick<PublicKeyCredentialCreationOptionsJSON, "extensions">,
  credential: Fido2CredentialView
): Promise<AndroidClientExtensionResults> {
  const parsedPrf = parsePrfInputs(request.extensions)
  if (parsedPrf == null) {
    credential.prfKey = null
    return {}
  }
  const { inputs: prfInputs, inputsAreHashed } = parsedPrf

  if (prfInputs.evalByCredential !== undefined) {
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.NotSupported)
  }

  credential.prfKey = Fido2Utils.bufferToString(generatePrfKey())
  const prfOutput: NonNullable<AndroidClientExtensionResults["prf"]> = {
    enabled: true,
  }

  if (prfInputs.eval != null) {
    prfOutput.results = encodePrfResults(
      await evaluateAndroidPrf(
        Fido2Utils.stringToBuffer(credential.prfKey),
        prfInputs.eval,
        inputsAreHashed
      )
    )
  }

  return { prf: prfOutput }
}

export async function getPrfClientExtensionResults(
  requestJson: string,
  credential: Fido2CredentialView,
  rawCredentialId: string
): Promise<AndroidClientExtensionResults> {
  const request = JSON.parse(requestJson) as PublicKeyCredentialRequestOptionsJSON
  const parsedPrf = parsePrfInputs(request.extensions)
  if (parsedPrf == null) {
    return {}
  }
  const { inputs: prfInputs, inputsAreHashed } = parsedPrf

  const allowCredentials = parseAllowCredentials(request.allowCredentials)
  validatePrfEvalByCredential(prfInputs, allowCredentials)

  if (!credential.prfKey) {
    return { prf: {} }
  }

  const credentialId = decodeBase64Url(rawCredentialId)
  const values = getPrfValuesForCredential(prfInputs, credentialId)
  if (values == null) {
    return { prf: {} }
  }

  const results = await evaluateAndroidPrf(
    Fido2Utils.stringToBuffer(credential.prfKey),
    values,
    inputsAreHashed
  )
  return { prf: { results: encodePrfResults(results) } }
}

type ParsedPrfInputs = {
  inputs: Fido2PrfInputs
  inputsAreHashed: boolean
}

function parsePrfInputs(extensions: unknown): ParsedPrfInputs | undefined {
  if (!isRecord(extensions)) {
    return undefined
  }

  const hasPrf = Object.prototype.hasOwnProperty.call(extensions, "prf")
  const hasPrfAlreadyHashed = Object.prototype.hasOwnProperty.call(extensions, "prfAlreadyHashed")
  if (hasPrf && hasPrfAlreadyHashed) {
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
  }
  if (!hasPrf && !hasPrfAlreadyHashed) {
    return undefined
  }

  const inputsAreHashed = hasPrfAlreadyHashed
  const rawPrf = inputsAreHashed ? extensions.prfAlreadyHashed : extensions.prf
  if (!isRecord(rawPrf)) {
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
  }

  const result: Fido2PrfInputs = {}
  if (rawPrf.eval !== undefined) {
    result.eval = parsePrfValues(rawPrf.eval, inputsAreHashed)
  }
  if (rawPrf.evalByCredential !== undefined) {
    if (!isRecord(rawPrf.evalByCredential)) {
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
    }

    result.evalByCredential = {}
    for (const [credentialId, values] of Object.entries(rawPrf.evalByCredential)) {
      result.evalByCredential[credentialId] = parsePrfValues(values, inputsAreHashed)
    }
  }
  return { inputs: result, inputsAreHashed }
}

function parsePrfValues(value: unknown, inputsAreHashed: boolean): Fido2PrfValues {
  if (!isRecord(value) || typeof value.first !== "string") {
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
  }
  if (value.second !== undefined && typeof value.second !== "string") {
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
  }

  const first = decodeBase64Url(value.first)
  const second = value.second === undefined ? undefined : decodeBase64Url(value.second as string)
  if (
    inputsAreHashed &&
    (first.byteLength !== 32 || (second != null && second.byteLength !== 32))
  ) {
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
  }

  return {
    first,
    second,
  }
}

function evaluateAndroidPrf(
  prfKey: BufferSource,
  values: Fido2PrfValues,
  inputsAreHashed: boolean
): Promise<Fido2PrfResults> {
  return inputsAreHashed ? evaluatePrfAlreadyHashed(prfKey, values) : evaluatePrf(prfKey, values)
}

function parseAllowCredentials(
  credentials: PublicKeyCredentialDescriptorJSON[] | undefined
): PublicKeyCredentialDescriptor[] | undefined {
  if (credentials == null) {
    return undefined
  }

  return credentials.map((credential) => ({
    id: decodeBase64Url(credential.id),
    type: "public-key",
  }))
}

function encodePrfResults(results: Fido2PrfResults) {
  return {
    first: Fido2Utils.bufferToString(results.first),
    second: results.second == null ? undefined : Fido2Utils.bufferToString(results.second),
  }
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) {
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
  }

  try {
    const decoded = Fido2Utils.stringToBuffer(value)
    if (Fido2Utils.bufferToString(decoded) !== value) {
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
    }
    return decoded
  } catch (error) {
    if (error instanceof Fido2AuthenticatorError) {
      throw error
    }
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Syntax)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function bufferToString(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = btoa(binary)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}
