import { CipherService, LogService } from "../abstractions"
import {
  Fido2AlgorithmIdentifier,
  Fido2AuthenticatorError,
  Fido2AuthenticatorErrorCode,
  Fido2AuthenticatorGetAssertionParams,
  Fido2AuthenticatorGetAssertionResult,
  Fido2AuthenticatorMakeCredentialResult,
  Fido2AuthenticatorMakeCredentialsParams,
  Fido2AuthenticatorService as Fido2AuthenticatorServiceAbstraction,
  PublicKeyCredentialDescriptor,
} from "../abstractions/fido2Authenticator.service"
import { CipherType } from "../enums"
import { checkForAbort, Utils } from "../misc/fido2/common"
import { compareCredentialIds, parseCredentialId } from "../misc/fido2/credential-id-utils"
import {
  createKeyPair,
  generateAuthData,
  generateSignature,
  getPrivateKeyFromFido2Credential,
} from "../misc/fido2/crypto"
import { Fido2Utils } from "../misc/fido2/fido2-utils"
import { guidToStandardFormat } from "../misc/fido2/guid-utils"
import { CBOR } from "../misc/fido2/cbor"
import { CipherView } from "../models/view"
import { Fido2CredentialView } from "../models/view/fido2CredentialView"

export class Fido2AuthenticatorService implements Fido2AuthenticatorServiceAbstraction {
  constructor(
    private logService: LogService,
    private cipherService: CipherService
  ) {}

  async makeCredential(
    params: Fido2AuthenticatorMakeCredentialsParams,
    abortController?: AbortController
  ): Promise<{
    response: Fido2AuthenticatorMakeCredentialResult
    fido2Credential: Fido2CredentialView
  }> {
    // All algorithms must be compatible with ES256, which is the only algorithm supported by the FIDO2 spec.
    if (params.credTypesAndPubKeyAlgs.every((p) => p.alg !== Fido2AlgorithmIdentifier.ES256)) {
      const requestedAlgorithms = params.credTypesAndPubKeyAlgs.map((p) => p.alg).join(", ")
      this.logService.warning(
        `[Fido2Authenticator] No compatible algorithms found, RP requested: ${requestedAlgorithms}`
      )
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.NotSupported)
    }

    // Validate resident key requirement
    if (params.requireResidentKey != undefined && typeof params.requireResidentKey !== "boolean") {
      this.logService.error(
        `[Fido2Authenticator] Invalid 'requireResidentKey' value: ${String(
          params.requireResidentKey
        )}`
      )
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Unknown)
    }

    // Validate user verification requirement
    if (
      params.requireUserVerification != undefined &&
      typeof params.requireUserVerification !== "boolean"
    ) {
      this.logService.error(
        `[Fido2Authenticator] Invalid 'requireUserVerification' value: ${String(
          params.requireUserVerification
        )}`
      )
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Unknown)
    }

    checkForAbort(abortController)

    // Check if there re any excluded credentials in the vault
    const existingCipherIds = await this.findExcludedCredentials(
      params.excludeCredentialDescriptorList || []
    )
    if (existingCipherIds.length > 0) {
      this.logService?.info(
        "[Fido2Authenticator] Aborting due to excluded credential found in vault."
      )
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.NotAllowed)
    }

    let fido2Credential: Fido2CredentialView
    let keyPair: CryptoKeyPair
    let userVerified = false
    let credentialId: string
    let pubKeyDer: ArrayBuffer

    checkForAbort(abortController)

    // Create new fido credential
    try {
      keyPair = await createKeyPair()
      pubKeyDer = await crypto.subtle.exportKey("spki", keyPair.publicKey)

      // TODO: check for user confirmation if needed
      userVerified = true
      if (!userVerified && params.requireUserVerification) {
        this.logService.warning(
          "[Fido2Authenticator] Aborting because user verification was unsuccessful."
        )
        throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.NotAllowed)
      }

      fido2Credential = await createKeyView(params, keyPair.privateKey)
      credentialId = fido2Credential.credentialId
    } catch (error) {
      this.logService.error(
        `[Fido2Authenticator] Aborting because of unknown error when creating credential: ${error}`
      )
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Unknown)
    }

    checkForAbort(abortController)

    // Return public key credential creation result
    const authData = await generateAuthData({
      rpId: params.rpEntity.id!,
      credentialId: parseCredentialId(credentialId)!,
      counter: fido2Credential.counter!,
      userPresence: true,
      userVerification: userVerified,
      keyPair,
    })
    const attestationObject = new Uint8Array(
      CBOR.encode({
        fmt: "none",
        attStmt: {},
        authData,
      })
    )

    return {
      response: {
        credentialId: parseCredentialId(credentialId)!,
        attestationObject,
        authData,
        publicKey: pubKeyDer,
        publicKeyAlgorithm: -7,
      },
      fido2Credential,
    }
  }

  async getAssertion(
    params: Fido2AuthenticatorGetAssertionParams,
    abortController?: AbortController
  ): Promise<Fido2AuthenticatorGetAssertionResult> {
    // Validate requireUserVerification
    if (
      params.requireUserVerification != undefined &&
      typeof params.requireUserVerification !== "boolean"
    ) {
      this.logService.error(
        `[Fido2Authenticator] Invalid 'requireUserVerification' value: ${String(
          params.requireUserVerification
        )}`
      )
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Unknown)
    }

    // Get a list of matching credentials from the vault
    let cipherOptions: CipherView[] = []
    cipherOptions = await this.findCredential(params, cipherOptions)

    if (cipherOptions.length === 0) {
      this.logService.info(
        "[Fido2Authenticator] Aborting because no matching credentials were found in the vault."
      )
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.NotAllowed)
    }

    const credentials: Fido2CredentialView[] = []
    cipherOptions.forEach((cipher) => {
      if (cipher.login.fido2Credentials && cipher.login.fido2Credentials.length > 0) {
        credentials.push(
          ...cipher.login.fido2Credentials.filter((cred) => cred.rpId === params.rpId)
        )
      }
    })

    if (params.allowCredentialDescriptorList) {
      // Filter credentials based on the allowCredentialDescriptorList
      const filteredCredentials = credentials.filter((cred) =>
        params.allowCredentialDescriptorList.some(
          (desc) => guidToStandardFormat(desc.id) === cred.credentialId
        )
      )
      if (filteredCredentials.length > 0) {
        credentials.length = 0
        credentials.push(...filteredCredentials)
      }
    }

    // If no credentials are found, abort the assertion
    if (credentials.length === 0) {
      this.logService.warning(
        `[Fido2Authenticator] No credentials found for RP ID: ${params.rpId}. Aborting assertion.`
      )

      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.NotAllowed)
    }

    // TODO: Implement user verification logic if needed
    const userVerified = true
    if (!userVerified && params.requireUserVerification) {
      this.logService.warning(
        "[Fido2Authenticator] Aborting because user verification was unsuccessful."
      )
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.NotAllowed)
    }

    try {
      const selectedFido2Credential: Fido2CredentialView = credentials[0]
      const selectedCredentialId = selectedFido2Credential.credentialId!

      if (selectedFido2Credential.counter! > 0) {
        ++selectedFido2Credential.counter!
      }

      checkForAbort(abortController)

      const authenticatorData = await generateAuthData({
        rpId: selectedFido2Credential.rpId!,
        credentialId: parseCredentialId(selectedCredentialId)!,
        counter: selectedFido2Credential.counter!,
        userPresence: true,
        userVerification: userVerified,
      })

      const signature = await generateSignature({
        authData: authenticatorData,
        clientDataHash: params.hash,
        privateKey: await getPrivateKeyFromFido2Credential(selectedFido2Credential),
      })

      return {
        authenticatorData,
        selectedCredential: {
          id: parseCredentialId(selectedCredentialId)!,
          userHandle: Fido2Utils.stringToBuffer(selectedFido2Credential.userHandle!)!,
        },
        signature,
      }
    } catch (error) {
      this.logService.error(
        `[Fido2Authenticator] Aborting because of unknown error when asserting credential: ${error}`
      )
      throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Unknown)
    }
  }

  async silentCredentialDiscovery(
    rpId: string,
    allowedCredentialIds?: string[]
  ): Promise<Fido2CredentialView[]> {
    const credentials = await this.findCredentialsByRp(rpId)
    const allowedGuidFormat =
      allowedCredentialIds?.map((id) => guidToStandardFormat(Fido2Utils.stringToBuffer(id))) || []
    const res: Fido2CredentialView[] = []

    credentials.forEach((cred) =>
      cred.login.fido2Credentials.forEach((c) => {
        if (c.rpId === rpId) {
          if (allowedGuidFormat.length > 0) {
            if (allowedGuidFormat.includes(c.credentialId)) {
              res.push(c)
            }
            return
          }
          res.push(c)
        }
      })
    )
    return res
  }

  // Change visibility to public to use in UI
  async findExcludedCredentials(
    credentials: PublicKeyCredentialDescriptor[]
  ): Promise<Fido2CredentialView[]> {
    const ids: string[] = []

    for (const credential of credentials) {
      try {
        ids.push(guidToStandardFormat(credential.id))
      } catch {
        //
      }
    }

    if (ids.length === 0) {
      return []
    }

    const ciphers = await this.cipherService.getAllDecrypted()
    return (
      // NOTE: currently, only one FIDO2 credential is supported per login
      ciphers
        .filter(
          (cipher) =>
            !cipher.isDeleted &&
            cipher.type === CipherType.Login &&
            cipher.login.hasFido2Credentials &&
            ids.includes(cipher.login.fido2Credentials[0].credentialId)
        )
        .map((cipher) => cipher.login.fido2Credentials[0])
    )
  }

  // ------------------------ PRIVATE METHODS ------------------------

  private async findCredential(
    params: Fido2AuthenticatorGetAssertionParams,
    cipherOptions: CipherView[]
  ) {
    if (params.allowCredentialDescriptorList?.length > 0) {
      cipherOptions = await this.findCredentialsById(
        params.allowCredentialDescriptorList,
        params.rpId
      )
    } else {
      cipherOptions = await this.findCredentialsByRp(params.rpId)
    }
    return cipherOptions
  }

  private async findCredentialsById(
    credentials: PublicKeyCredentialDescriptor[],
    rpId: string
  ): Promise<CipherView[]> {
    if (credentials.length === 0) {
      return []
    }

    const ciphers = await this.cipherService.getAllDecrypted()
    return ciphers.filter(
      (cipher) =>
        !cipher.isDeleted &&
        cipher.type === CipherType.Login &&
        cipher.login.hasFido2Credentials &&
        cipher.login.fido2Credentials[0].rpId === rpId &&
        credentials.some((credential) =>
          compareCredentialIds(
            credential.id,
            parseCredentialId(cipher.login.fido2Credentials[0].credentialId)
          )
        )
    )
  }

  private async findCredentialsByRp(rpId: string): Promise<CipherView[]> {
    const ciphers = await this.cipherService.getAllDecrypted()
    return ciphers.filter((cipher) => {
      if (
        cipher.isDeleted ||
        cipher.type !== CipherType.Login ||
        !cipher.login.hasFido2Credentials
      ) {
        return false
      }
      return !!cipher.login.fido2Credentials.find((c) => c.rpId === rpId && c.discoverable)
    })
  }
}

// ---------------------- SUPPORTING FUNCTIONS -------------------------

async function createKeyView(
  params: Fido2AuthenticatorMakeCredentialsParams,
  keyValue: CryptoKey
): Promise<Fido2CredentialView> {
  if (keyValue.algorithm.name !== "ECDSA" && (keyValue.algorithm as any).namedCurve !== "P-256") {
    throw new Fido2AuthenticatorError(Fido2AuthenticatorErrorCode.Unknown)
  }

  const pkcs8Key = await crypto.subtle.exportKey("pkcs8", keyValue)
  const fido2Credential = new Fido2CredentialView()
  fido2Credential.credentialId = Utils.newGuid()
  fido2Credential.keyType = "public-key"
  fido2Credential.keyAlgorithm = "ECDSA"
  fido2Credential.keyCurve = "P-256"
  fido2Credential.keyValue = Fido2Utils.bufferToString(pkcs8Key)
  fido2Credential.rpId = params.rpEntity.id!
  fido2Credential.userHandle = Fido2Utils.bufferToString(params.userEntity.id)
  fido2Credential.userName = params.userEntity.name!
  fido2Credential.counter = 0
  fido2Credential.rpName = params.rpEntity.name
  fido2Credential.userDisplayName = params.userEntity.displayName!
  fido2Credential.discoverable = params.requireResidentKey
  fido2Credential.creationDate = new Date()

  return fido2Credential
}
