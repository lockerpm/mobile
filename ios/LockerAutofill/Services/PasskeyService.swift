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
import SwiftASN1


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
  supportedAlgos: [ASCOSEAlgorithmIdentifier],
  userVerification: ASAuthorizationPublicKeyCredentialUserVerificationPreference
) throws -> (ASPasskeyRegistrationCredential, PasskeyMetadata) {
  print("🚀 Start creating passkey for RP: \(relyingParty)")
  print("📑 Supported algos from RP: \(supportedAlgos.map { $0.rawValue })")
  print("🔐 UserVerification preference: \(userVerification.rawValue)")
  var flags: UInt8 = 0x41 | 0x08 | 0x10 | 0x80 // AT + UP + ED + BE + BS
  // Pick best algorithm that both sides support
  let serverAlgos = Set(supportedAlgos.map { $0.rawValue })
  let priority: [Int] = [-7, -257] // prefer ES256 > EdDSA > RSA
  guard let chosenAlg = priority.first(where: { serverAlgos.contains($0) }) else {
    throw NSError(domain: "Passkey", code: -2, userInfo: [NSLocalizedDescriptionKey: "No compatible algorithm"])
  }
  print("✅ Chosen algorithm: \(chosenAlg)")
  
  var keyAttr: [String: Any] = [:]
  var coseKeyCBOR: Data = Data()
  let credentialAlg = chosenAlg
  var pubData: Data
  
  let keychainTag = "com.cystack.lockerapp.passkey.\(UUID().uuidString)"
  
  // --- Access Control depending on UV preference ---
  var accessControl: SecAccessControl? = nil
  switch userVerification {
  case .required:
    flags |= 0x04
    print("required control 111")
    // enforce Face ID / Touch ID (or passcode fallback)
    accessControl = SecAccessControlCreateWithFlags(
      nil,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      [.privateKeyUsage, .biometryCurrentSet],
      nil
    )
  case .preferred:
    print("preferred control 222")
    // try biometrics if available, but not strictly required
    accessControl = SecAccessControlCreateWithFlags(
      nil,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      [.privateKeyUsage, .userPresence],
      nil
    )
  case .discouraged:
    print("preferred control 333")
    // no user verification – just key usage
    accessControl = SecAccessControlCreateWithFlags(
      nil,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      [.privateKeyUsage],
      nil
    )
  default:
    accessControl = nil
  }
  
  // Generate keypair depending on algorithm
  switch chosenAlg {
  case -7: // ES256, P-256
    keyAttr = [
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeySizeInBits as String: 256,
      kSecPrivateKeyAttrs as String: [
        kSecAttrIsPermanent as String: false,
        kSecAttrApplicationTag as String: keychainTag,
//        kSecAttrAccessControl as String: accessControl as Any
      ]
    ]
    guard let privateKey = SecKeyCreateRandomKey(keyAttr as CFDictionary, nil),
          let publicKey = SecKeyCopyPublicKey(privateKey),
          let pubRaw = SecKeyCopyExternalRepresentation(publicKey, nil) as Data? else {
      throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "Key generation failed (EC)"])
    }
    pubData = pubRaw
    
    let xCoord = pubData.dropFirst(1).prefix(32)
    let yCoord = pubData.dropFirst(33).prefix(32)
    
    print("pubData length: \(pubData.count) bytes") // should be 65
    print("xCoord: \(xCoord as NSData)", "xCoord count: \(xCoord.count)")
    print("yCoord: \(yCoord as NSData)", "yCoord count: \(yCoord.count)")
   
    
//    coseKey = [
//      CBOR.unsignedInt(1): CBOR.unsignedInt(2),       // kty: EC2
//      CBOR.unsignedInt(3): CBOR.negativeInt(7),       // alg: ES256
//      CBOR.negativeInt(1): CBOR.unsignedInt(1),       // crv: P-256
//      CBOR.negativeInt(2): CBOR.byteString(Array(xCoord)), // x
//      CBOR.negativeInt(3): CBOR.byteString(Array(yCoord)), // y
//    ]
    coseKeyCBOR = coseKeyCBORManual(xCoord: Array(xCoord), yCoord: Array(yCoord))
  case -257: // RS256
    keyAttr = [
      kSecAttrKeyType as String: kSecAttrKeyTypeRSA,
      kSecAttrKeySizeInBits as String: 2048,
      kSecPrivateKeyAttrs as String: [
        kSecAttrIsPermanent as String: true,
        kSecAttrApplicationTag as String: keychainTag,
        kSecAttrAccessControl as String: accessControl as Any
      ]
    ]
    
    guard let privateKey = SecKeyCreateRandomKey(keyAttr as CFDictionary, nil),
          let publicKey = SecKeyCopyPublicKey(privateKey),
          let pubRaw = SecKeyCopyExternalRepresentation(publicKey, nil) as Data? else {
      throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "Key generation failed (RSA)"])
    }
    pubData = pubRaw
    print("pubData length 123123123123: \(pubData.count) bytes") // should be 65
    
    // TODO: ⚠️ Proper ASN.1 parsing required in production!
    let n = pubData.suffix(pubData.count - 24)
    let e = Data([0x01, 0x00, 0x01]) // 65537
    
//    coseKey = [
//      CBOR.unsignedInt(1): CBOR.unsignedInt(3),    // kty: RSA
//      CBOR.unsignedInt(3): CBOR.negativeInt(257),  // alg: RS256
//      CBOR.negativeInt(1): CBOR.byteString([UInt8](n)), // n
//      CBOR.negativeInt(2): CBOR.byteString([UInt8](e))  // e
//    ]
    
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
  
  print("📏 rpIdHash:", rpIdHash)
  print("🚩 flags:", String(format: "0x%02X", flags))
  print("🧮 signCount:", signCount)
  print("🧾 aaguid:", aaguid.count)
  print("🔑 credentialId length:", credentialId.count)
  print("🔑 credentialIdLen field:", credentialIdLen)
  print("📦 coseKeyCBOR length:", coseKeyCBOR.count)
  print("📦 total authData length:", authData.count)
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
  
  let metadata = PasskeyMetadata(
    credentialId: credentialId.base64EncodedString(),
    rpId: relyingParty,
    userId: userId.base64EncodedString().trimmingCharacters(in: CharacterSet(charactersIn: "=")),
    userName: userName,
    alg: credentialAlg,
    keychainTag: keychainTag, // insert actual tag if needed
    createdAt: ISO8601DateFormatter().string(from: Date())
  )
  
  return (credential, metadata)
}


func coseKeyCBORManual(xCoord: [UInt8], yCoord: [UInt8]) -> Data {
    precondition(xCoord.count == 32)
    precondition(yCoord.count == 32)
    
    var cbor: [UInt8] = []
    cbor.append(0xa5)           // map(5)
    
    // 1: 2
    cbor.append(0x01)
    cbor.append(0x02)
    
    // 3: -7
    cbor.append(0x03)
    cbor.append(0x26)           // -7 in CBOR (negative int: 7 -> 0x26)
    
    // -1: 1
    cbor.append(0x20)           // -1 in CBOR map key
    cbor.append(0x01)
    
    // -2: x
    cbor.append(0x21)           // -2 in CBOR map key
    cbor.append(0x58)           // byte string of length 32 (major type 2, additional 24)
    cbor.append(0x20)           // 32 bytes
    cbor.append(contentsOf: xCoord)
    
    // -3: y
    cbor.append(0x22)           // -3 in CBOR map key
    cbor.append(0x58)           // byte string of length 32
    cbor.append(0x20)
    cbor.append(contentsOf: yCoord)
    
    return Data(cbor)
}
