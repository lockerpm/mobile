//
//  Passkey.swift
//  Locker
//
//

import CryptoKit
import SwiftCBOR
import Foundation
import AuthenticationServices


@available(iOS 17.0, *)
func passkeyRegistration(
  passkeyReq: ASPasskeyCredentialRequest,
  passkeyId: ASPasskeyCredentialIdentity
) throws -> (ASPasskeyRegistrationCredential, TempPasskeyItem) {
  let userVerification = passkeyReq.userVerificationPreference
  let relyingParty = passkeyId.relyingPartyIdentifier
  let clientDataHash = passkeyReq.clientDataHash // hashed clientData JSON (challenge)
  let userId = passkeyId.userHandle
  let userName = passkeyId.userName
  
  print("🚀 Start creating passkey for RP: \(relyingParty), username: \(userName), userId: \(userId)")
  
  
  var flags: UInt8 = 0x41 | 0x08 | 0x10 | 0x80 | 0x04 // AT + UP + ED + BE + BS + UV
  
  let chosenAlg = try publicKeyAlgSelect(passkeyReq.supportedAlgorithms)
  var coseKeyCBOR: Data = Data()
  var publicKeyData: Data
  var privateKeyData: Data

  // Generate keypair depending on algorithm
  switch chosenAlg {
  case -7: // ES256, P-256
    let keyAttr = [
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeySizeInBits as String: 256,
      kSecAttrIsPermanent as String: false,
      kSecAttrIsExtractable as String: true // 🔑 allow export
    ] as [String : Any]
    guard
      let privateKey = SecKeyCreateRandomKey(keyAttr as CFDictionary, nil),
      let publicKey = SecKeyCopyPublicKey(privateKey),
      let pubRaw = SecKeyCopyExternalRepresentation(publicKey, nil) as Data?,
      let privRaw = SecKeyCopyExternalRepresentation(privateKey, nil) as Data?
    else {
      throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "Key generation failed (EC)"])
    }
    publicKeyData = pubRaw
    privateKeyData = privRaw
    let xCoord = publicKeyData.dropFirst(1).prefix(32)
    let yCoord = publicKeyData.dropFirst(33).prefix(32)
    
    
    coseKeyCBOR = es256CBOREncode(xCoord: Array(xCoord), yCoord: Array(yCoord))
  case -257: // RS256
    let keyAttr = [
      kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
      kSecAttrKeySizeInBits as String: 2048,
      kSecAttrIsPermanent as String: false,
      kSecAttrIsExtractable as String: true // 🔑 allow export
    ] as [String : Any]
    
    guard
      let privateKey = SecKeyCreateRandomKey(keyAttr as CFDictionary, nil),
      let publicKey = SecKeyCopyPublicKey(privateKey),
      let pubRaw = SecKeyCopyExternalRepresentation(publicKey, nil) as Data?,
      let privRaw = SecKeyCopyExternalRepresentation(privateKey, nil) as Data?
    else {
      throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "Key generation failed (RSA)"])
    }
    publicKeyData = pubRaw
    privateKeyData = privRaw
    let rsa = try extractRSAComponents(from: publicKey)

    coseKeyCBOR = es256CBOREncode(xCoord: Array(rsa.modulus), yCoord: Array(rsa.exponent))
  default:
    throw NSError(domain: "Passkey", code: -3, userInfo: [NSLocalizedDescriptionKey: "Unsupported algorithm"])
  }
  
  // Encode COSE key
  //  let coseKeyCBOR = Data(CBOR.encode(CBOR.map(coseKey)))
  print("✅ COSE key encoded, size: \(coseKeyCBOR.count)", coseKeyCBOR.map { String(format: "%02x", $0) }.joined())
  
  // Build authenticator data (same for all algs)
  let rpIdHash = SHA256.hash(data: relyingParty.data(using: .utf8)!)
  let signCount: [UInt8] = [0,0,0,0]
  let credentialId = Data((0..<16).map { _ in UInt8.random(in: 0...255) })
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
  
  print("📦 authData hex:", authData.map { String(format: "%02x", $0) }.joined())
  
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
  
  let metadata = TempPasskeyItem(
    credentialId: dataToStringWithoutPadding(credentialId),
    rpId: relyingParty,
    userId: dataToStringWithoutPadding(userId),
    userName: userName,
    alg: chosenAlg,
    privateKey: dataToStringWithoutPadding(privateKeyData),
    createdAt: ISO8601DateFormatter().string(from: Date())
  )
  
  print("TempPasskeyItem", metadata)
  return (credential, metadata)
}
