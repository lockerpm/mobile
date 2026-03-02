//
//  Passkey.swift
//  Locker
//
//

import CryptoKit
import SwiftCBOR
import Foundation
import AuthenticationServices


@available(iOSApplicationExtension 17.0, *)
func createPasskeyRegistrationCredential(
  passkeyReq: ASPasskeyCredentialRequest,
  passkeyId: ASPasskeyCredentialIdentity
) throws -> (ASPasskeyRegistrationCredential, PasskeyItem) {
  let relyingParty = passkeyId.relyingPartyIdentifier
  let clientDataHash = passkeyReq.clientDataHash // hashed clientData JSON (challenge)
  let userId = passkeyId.userHandle
  let userName = passkeyId.userName
  
  let flags: UInt8 = 0x41 | 0x08 | 0x10 | 0x80 | 0x04 // AT + UP + ED + BE + BS + UV
  
  
  // Generate keypair depending on algorithm
  let privateKey = P256.Signing.PrivateKey()
  let publicKey = privateKey.publicKey
  
  let publicKeyData = publicKey.rawRepresentation
  let xCoord = publicKeyData.prefix(32)
  let yCoord = publicKeyData.suffix(32)
  
  let coseKeyCBOR: Data = es256CBOREncode(xCoord: Array(xCoord), yCoord: Array(yCoord))


  guard
    let guid = GuidUtils.newGuid() as String?,
    let credentialId = try? GuidUtils.guidToRawFormat(guid)
  else {
    throw NSError(domain: "GUID", code: 2, userInfo: [NSLocalizedDescriptionKey: "Can not create credentialId"])
  }
  
  // Build authenticator data (same for all algs)
  let rpIdHash = SHA256.hash(data: relyingParty.data(using: .utf8)!)
  let signCount: [UInt8] = [0,0,0,0]
  let credentialIdLen: [UInt8] = [UInt8(credentialId.count >> 8), UInt8(credentialId.count & 0xff)]
  let aaguid = Data(repeating: 0, count: 16)
  
  var authData = Data()
  authData.append(contentsOf: rpIdHash)
  authData.append(flags)
  authData.append(contentsOf: signCount)
  authData.append(aaguid)
  authData.append(contentsOf: credentialIdLen)
  authData.append(credentialId)
  authData.append(coseKeyCBOR)
  
  // Add extensions (credProps)
  let extMap: [CBOR: CBOR] = [
    CBOR.utf8String("credProps"): CBOR.map([
      CBOR.utf8String("rk"): CBOR.boolean(true)
    ])
  ]
  let extBytesArray =  CBOR.encode(CBOR.map(extMap))(options: CBOROptions())
  let extBytes = Data(extBytesArray)
  authData.append(extBytes) // append whole extension map after COSE key
  
  
  let attestationObject: [CBOR: CBOR] = [
    CBOR.utf8String("fmt"): CBOR.utf8String("none"),
    CBOR.utf8String("attStmt"): CBOR.map([:]),
    CBOR.utf8String("authData"): CBOR.byteString([UInt8](authData))
  ]
  let attestationCBOR = Data(CBOR.encode(CBOR.map(attestationObject)))
  
  let credential = ASPasskeyRegistrationCredential(
    relyingParty: relyingParty,
    clientDataHash: clientDataHash,
    credentialID: credentialId,
    attestationObject: attestationCBOR
  )
  
  let pkcs8Key = exportP256ToPKCS8(privateKey)
  
  let metadata = PasskeyItem(
    credentialId: guid,
    keyValue: pkcs8Key.base64URLEncodedString(),
    rpId: relyingParty,
    userHandle: userId.base64URLEncodedString(),
    userName: userName
  )
  
  return (credential, metadata)
}


// The main function
@available(iOSApplicationExtension 17.0, *)
func createAssertionFromGuid(
  item: PasskeyItem,
  rpId: String,
  clientDataHash: Data
) throws -> ASPasskeyAssertionCredential {
 
  // 1) Basic RP check
  guard item.rpId == rpId else {
    throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "RP mismatch"])
  }
  
  // 2) Credential ID, userHandle, privatekey Data
  guard let credId = try GuidUtils.guidToRawFormat(item.credentialId) as Data?,
        let userHandle =  Data(base64URLEncoded: item.userHandle),
        let privData = Data(base64URLEncoded: item.keyValue)
  else {
    throw NSError(domain: "Passkey", code: -2, userInfo: [NSLocalizedDescriptionKey: "Invalid credentialId, userId, privateKey encoding"])
  }
  // 3) Create p256 private key
  guard let privateKey = fromPKCS8ToP256(privData)
  else {
    throw NSError(domain: "Passkey", code: -2, userInfo: [NSLocalizedDescriptionKey: "webCryptoPKCS8Base64URLToP256PrivateKey failed"])
  }
  
  
  // 4) Build authenticatorData for assertion: rpIdHash(32) + flags(1) + signCount(4)
  let rpIdHash = Data(SHA256.hash(data: rpId.data(using: .utf8)!))
  let flags: UInt8 = 0x01 | 0x08 | 0x10 | 0x04  // UP + BE + BS
  // set UV bit if requestParams requires user verification (optional)

  let signCount: [UInt8] = [0,0,0,0]
  var authData = Data()
  authData.append(rpIdHash)
  authData.append(flags)
  authData.append(contentsOf: signCount)
  
  // 6) Build message to sign = authenticatorData || clientDataHash (the system provided clientDataHash)
  var messageToSign = Data()
  messageToSign.append(authData)
  messageToSign.append(clientDataHash) // already a SHA-256 of clientDataJSON
  
  
  guard let signature = try! privateKey.signature(for: messageToSign) as P256.Signing.ECDSASignature?
  else {
    throw NSError(domain: "Passkey", code: -7, userInfo: [NSLocalizedDescriptionKey: "Signature generation failed"])
  }


  // 8) build and return ASPasskeyAssertionCredential
  let assertion = ASPasskeyAssertionCredential(
    userHandle: userHandle,
    relyingParty: rpId,
    signature: signature.derRepresentation,
    clientDataHash: clientDataHash,
    authenticatorData: authData,
    credentialID: credId
  )
  
  print("✅ Created ASPasskeyAssertionCredential — returning to system")
  return assertion
}


// Deprecated
@available(iOSApplicationExtension 17.0, *)
func createAssertionRaw(
  item: PasskeyItem,
  rpId: String,
  clientDataHash: Data
) throws -> ASPasskeyAssertionCredential {
  // 1) Basic RP check
  guard item.rpId == rpId else {
    throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "RP mismatch"])
  }
  
  // 2) Credential ID, userHandle, privatekey Data
  guard let credId = Data(base64URLEncoded: item.credentialId),
        let userHandle =  Data(base64URLEncoded: item.userHandle),
        let privData = Data(base64URLEncoded: item.keyValue)
  else {
    throw NSError(domain: "Passkey", code: -2, userInfo: [NSLocalizedDescriptionKey: "Invalid credentialId, userId, privateKey encoding"])
  }
  
  
  // 3) Attempt direct import privateKey
  let importOptions: [String: Any] = [
    kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
    kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
    kSecAttrKeySizeInBits as String: 256,
  ]
  var cfErr: Unmanaged<CFError>?
  guard let privateKey = SecKeyCreateWithData(privData as CFData, importOptions as CFDictionary, &cfErr) as SecKey?
  else {
    throw NSError(domain: "Passkey", code: -2, userInfo: [NSLocalizedDescriptionKey: "SecKeyCreateWithData failed:"])
  }
  
  // 4) Build authenticatorData for assertion: rpIdHash(32) + flags(1) + signCount(4)
  let rpIdHash = Data(SHA256.hash(data: rpId.data(using: .utf8)!))
  var flags: UInt8 = 0x01 | 0x08 | 0x10 | 0x04  // UP + BE + BS
  // set UV bit if requestParams requires user verification (optional)
//  if requestParams.userVerificationPreference == .required {
//    flags |= 0x04
//  }
  let signCount: [UInt8] = [0,0,0,0]
  var authData = Data()
  authData.append(rpIdHash)
  authData.append(flags)
  authData.append(contentsOf: signCount)
  
  // 6) Build message to sign = authenticatorData || clientDataHash (the system provided clientDataHash)
  var messageToSign = Data()
  messageToSign.append(authData)
  messageToSign.append(clientDataHash) // already a SHA-256 of clientDataJSON
  
  
  // 7) Sign using SecKey (use message variant so SecKey does the hashing)
  guard SecKeyIsAlgorithmSupported(privateKey, .sign, .ecdsaSignatureMessageX962SHA256) else {
    throw NSError(domain: "Passkey", code: -6, userInfo: [NSLocalizedDescriptionKey: "Signing algorithm not supported by key"])
  }
  
  cfErr = nil
  guard let signature = SecKeyCreateSignature(privateKey, .ecdsaSignatureMessageX962SHA256, messageToSign as CFData, &cfErr) as Data? else {
    throw NSError(domain: "Passkey", code: -7, userInfo: [NSLocalizedDescriptionKey: "Signature generation failed"])
  }


  // 8) build and return ASPasskeyAssertionCredential
  let assertion = ASPasskeyAssertionCredential(
    userHandle: userHandle,
    relyingParty: rpId,
    signature: signature,
    clientDataHash: clientDataHash,
    authenticatorData: authData,
    credentialID: credId
  )
  
  return assertion
}
