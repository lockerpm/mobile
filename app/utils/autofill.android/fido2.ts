import { encode as btoa } from "base-64"
import crypto from "react-native-quick-crypto"
import { CryptoKeyPair, CryptoKey } from "react-native-quick-crypto/src/keys"

import { Utils } from "core/misc/fido2/common"
import { Fido2CredentialView } from "core/models/view/fido2CredentialView"

export const createFido2SimpleView = async (
  requestJson: string
): Promise<{ fido2View: Fido2CredentialView; publicKey: string }> => {
  const params: PublicKeyCredentialCreationOptionsJSON = JSON.parse(requestJson)

  // Generate a credential key pair
  const keyPair = (await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256", // secp256r1 is also known as P-256
    },
    true, // extractable
    ["sign", "verify"]
  )) as CryptoKeyPair

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

  const result = { fido2View: fido2Credential, publicKey: publicKeyString }

  return result
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
