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
  let alg: Int
  let keychainTag: String
  let createdAt: String
}

@available(iOS 17.0, *)
func createPasskeyWithExportableKey(
  relyingParty: String,
  clientDataHash: Data,
  userId: Data
) throws -> (ASPasskeyRegistrationCredential, PasskeyMetadata) {
  print("🚀 Start creating passkey for RP: \(relyingParty)")
  
  // 1. Generate EC P-256 key pair
  let keychainTag = "com.example.passkey.\(UUID().uuidString)"
  print("🔑 Keychain tag: \(keychainTag)")
  
  let keyAttr: [String: Any] = [
    kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
    kSecAttrKeySizeInBits as String: 256,
    kSecPrivateKeyAttrs as String: [
      kSecAttrIsPermanent as String: true,
      kSecAttrApplicationTag as String: keychainTag
    ]
  ]
  guard let privateKey = SecKeyCreateRandomKey(keyAttr as CFDictionary, nil) else {
    throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "Key generation failed"])
  }
  guard let publicKey = SecKeyCopyPublicKey(privateKey) else {
    throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "No public key"])
  }
  print("✅ Key pair generated successfully")
  
  // 2. Extract raw public key
  var error: Unmanaged<CFError>?
  guard let pubData = SecKeyCopyExternalRepresentation(publicKey, &error) as Data? else {
    print("❌ Public key export error: \(String(describing: error))")
    throw error!.takeRetainedValue() as Error
  }
  print("📏 Public key raw size: \(pubData.count) bytes")
  
  let xCoord = pubData.dropFirst(1).prefix(32)
  let yCoord = pubData.dropFirst(1 + 32).prefix(32)
  print("🔢 Public key X: \(xCoord.base64EncodedString())")
  print("🔢 Public key Y: \(yCoord.base64EncodedString())")
  
  // 3. Build COSE_Key
  let coseKey: [CBOR: CBOR] = [
    CBOR.unsignedInt(1): CBOR.unsignedInt(2),   // kty: EC2
    CBOR.unsignedInt(3): CBOR.negativeInt(6),   // alg: -7 (ES256)
    CBOR.negativeInt(0): CBOR.unsignedInt(1),   // -1 → crv: P-256
    CBOR.negativeInt(1): CBOR.byteString([UInt8](xCoord)), // -2 → x
    CBOR.negativeInt(2): CBOR.byteString([UInt8](yCoord))  // -3 → y
  ]
  let coseKeyCBOR = Data(CBOR.encode(.map(coseKey))(options: CBOROptions()))
  print("✅ COSE key encoded, size: \(coseKeyCBOR.count) bytes")
  
  // 4. Authenticator data
  let rpIdHash = SHA256.hash(data: relyingParty.data(using: .utf8)!)
  let flags: UInt8 = 0x41
  let signCount: [UInt8] = [0,0,0,0]
  
  let credentialId = UUID().uuidString.data(using: .utf8)! // random ID
  let credentialIdLen: [UInt8] = [
    UInt8(credentialId.count >> 8),
    UInt8(credentialId.count & 0xff)
  ]
  print("🆔 Credential ID (UUID-based): \(credentialId.base64EncodedString())")
  
  var authData = Data()
  authData.append(contentsOf: rpIdHash)
  authData.append(flags)
  authData.append(contentsOf: signCount)
  authData.append(contentsOf: credentialIdLen)
  authData.append(credentialId)
  authData.append(coseKeyCBOR)
  print("✅ Authenticator data built, size: \(authData.count) bytes")
  
  // 5. Attestation object
  let attestationObject: [CBOR: CBOR] = [
    CBOR.utf8String("fmt"): CBOR.utf8String("none"),
    CBOR.utf8String("attStmt"): CBOR.map([:]),
    CBOR.utf8String("authData"): CBOR.byteString([UInt8](authData))
  ]
  let attestationCBOR = Data(CBOR.encode(.map(attestationObject))(options: CBOROptions()))
  print("✅ Attestation object encoded, size: \(attestationCBOR.count) bytes")
  
  // 6. Build credential
  let credential = ASPasskeyRegistrationCredential(
    relyingParty: relyingParty,
    clientDataHash: clientDataHash,
    credentialID: credentialId,
    attestationObject: attestationCBOR
  )
  print("🎉 ASPasskeyRegistrationCredential created successfully")
  
  // 7. Build metadata JSON
  let metadata = PasskeyMetadata(
    credentialId: credentialId.base64EncodedString(),
    rpId: relyingParty,
    userId: userId.base64EncodedString(),
    alg: -7,
    keychainTag: keychainTag,
    createdAt: ISO8601DateFormatter().string(from: Date())
  )
  print("📦 Metadata prepared: \(metadata)")
  
  return (credential, metadata)
}
