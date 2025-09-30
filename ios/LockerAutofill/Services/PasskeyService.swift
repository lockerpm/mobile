//
//  Passkey.swift
//  Locker
//
//  Created by Nguyen Thinh on 26/9/25.
//

import CryptoKit
import SwiftCBOR
import Foundation
import AuthenticationServices

struct PasskeyMetadata: Codable {
  let credentialId: String   // Base64URL
  let rpId: String
  let userId: String         // Base64URL
  let userName: String
  let alg: Int
  let keychainTag: String
  let createdAt: String
}

@available(iOS 17.0, *)
func createPasskeyWithExportableKey(
  relyingParty: String,
  clientDataHash: Data,
  userId: Data,
  userName: String,
  supportedAlgos: [ASCOSEAlgorithmIdentifier]
) throws -> (ASPasskeyRegistrationCredential, PasskeyMetadata) {
  print("🚀 Start creating passkey for RP: \(relyingParty)")
  print("📑 Supported algos from RP: \(supportedAlgos.map { $0.rawValue })")
  
  // Pick best algorithm that both sides support
  let serverAlgos = Set(supportedAlgos.map { $0.rawValue })
  let priority: [Int] = [-7, -8, -257] // prefer ES256 > EdDSA > RSA
  guard let chosenAlg = priority.first(where: { serverAlgos.contains($0) }) else {
    throw NSError(domain: "Passkey", code: -2, userInfo: [NSLocalizedDescriptionKey: "No compatible algorithm"])
  }
  print("✅ Chosen algorithm: \(chosenAlg)")
  
  var keyAttr: [String: Any] = [:]
  var coseKey: [CBOR: CBOR] = [:]
  var credentialAlg = chosenAlg
  var pubData: Data
  var xCoord: Data? = nil
  var yCoord: Data? = nil
  
  // Generate keypair depending on algorithm
  switch chosenAlg {
  case -7: // ES256, P-256
    let keychainTag = "com.example.passkey.\(UUID().uuidString)"
    keyAttr = [
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeySizeInBits as String: 256,
      kSecPrivateKeyAttrs as String: [
        kSecAttrIsPermanent as String: true,
        kSecAttrApplicationTag as String: keychainTag
      ]
    ]
    guard let privateKey = SecKeyCreateRandomKey(keyAttr as CFDictionary, nil),
          let publicKey = SecKeyCopyPublicKey(privateKey) else {
      throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "Key generation failed (EC)"])
    }
    pubData = SecKeyCopyExternalRepresentation(publicKey, nil)! as Data
    
    // Split into X and Y coords
    xCoord = pubData.dropFirst(1).prefix(32)
    yCoord = pubData.dropFirst(1 + 32).prefix(32)
    
    coseKey = [
      CBOR.unsignedInt(1): CBOR.unsignedInt(2),       // kty: EC2
      CBOR.unsignedInt(3): CBOR.negativeInt(7),          // alg: ES256
      CBOR.negativeInt(1): CBOR.unsignedInt(1),       // crv: P-256
      CBOR.negativeInt(2): CBOR.byteString([UInt8](xCoord!)), // x
      CBOR.negativeInt(3): CBOR.byteString([UInt8](yCoord!))  // y
    ]
  case -257: // RS256
    let keychainTag = "com.example.passkey.\(UUID().uuidString)"
    keyAttr = [
      kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
      kSecAttrKeySizeInBits as String: 2048,
      kSecPrivateKeyAttrs as String: [
        kSecAttrIsPermanent as String: true,
        kSecAttrApplicationTag as String: keychainTag
      ]
    ]
    guard let privateKey = SecKeyCreateRandomKey(keyAttr as CFDictionary, nil),
          let publicKey = SecKeyCopyPublicKey(privateKey) else {
      throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "Key generation failed (RSA)"])
    }
    pubData = SecKeyCopyExternalRepresentation(publicKey, nil)! as Data
    
    // Parse ASN.1 RSA key to extract n (modulus) and e (exponent) if needed
    // For simplicity assume exponent=65537 and strip ASN.1 header
    // (needs proper parsing for production)
    
    let n = pubData.suffix(pubData.count - 24) // rough cut, must parse ASN.1 properly
    let e = Data([0x01, 0x00, 0x01]) // 65537
    
    coseKey = [
      CBOR.unsignedInt(1): CBOR.unsignedInt(3),       // kty: RSA
      CBOR.unsignedInt(3): CBOR.negativeInt(257),        // alg: RS256
      CBOR.negativeInt(1): CBOR.byteString([UInt8](n)), // n
      CBOR.negativeInt(2): CBOR.byteString([UInt8](e))  // e
    ]
    
  default:
    throw NSError(domain: "Passkey", code: -3, userInfo: [NSLocalizedDescriptionKey: "Unsupported algorithm"])
  }
  
  // Encode COSE key
  let coseKeyCBOR = Data(CBOR.encode(CBOR.map(coseKey)))
  print("✅ COSE key encoded, size: \(coseKeyCBOR.count)")
  
  // Build authenticator data (same for all algs)
  let rpIdHash = SHA256.hash(data: relyingParty.data(using: .utf8)!)
  let flags: UInt8 = 0x41
  let signCount: [UInt8] = [0,0,0,0]
  let credentialId = Data((0..<16).map { _ in UInt8.random(in: 0...255) })
  let credentialIdLen: [UInt8] = [UInt8(credentialId.count >> 8), UInt8(credentialId.count & 0xff)]
  
  var authData = Data()
  authData.append(contentsOf: rpIdHash)
  authData.append(flags)
  authData.append(contentsOf: signCount)
  authData.append(contentsOf: credentialIdLen)
  authData.append(credentialId)
  authData.append(coseKeyCBOR)
  
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
  
  let metadata = PasskeyMetadata(
    credentialId: credentialId.base64EncodedString(),
    rpId: relyingParty,
    userId: userId.base64EncodedString().trimmingCharacters(in: CharacterSet(charactersIn: "=")),
    userName: userName,
    alg: credentialAlg,
    keychainTag: "TODO", // insert actual tag if needed
    createdAt: ISO8601DateFormatter().string(from: Date())
  )
  
  return (credential, metadata)
}
