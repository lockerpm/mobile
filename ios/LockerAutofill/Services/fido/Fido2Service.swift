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
  let relyingParty = passkeyId.relyingPartyIdentifier
  let clientDataHash = passkeyReq.clientDataHash // hashed clientData JSON (challenge)
  let userId = passkeyId.userHandle
  let userName = passkeyId.userName
  
  print("🚀 Start creating passkey for RP: \(relyingParty), username: \(userName), userId: \(userId)", "support alg: ", passkeyReq.supportedAlgorithms)
  
  
  let flags: UInt8 = 0x41 | 0x08 | 0x10 | 0x80 | 0x04 // AT + UP + ED + BE + BS + UV
  
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
    credentialId: credentialId.base64URLEncodedString(),
    rpId: relyingParty,
    userId: userId.base64URLEncodedString(),
    userName: userName,
    alg: chosenAlg,
    privateKey: privateKeyData.base64URLEncodedString(),
    createdAt: ISO8601DateFormatter().string(from: Date())
  )
  
  print("TempPasskeyItem", metadata)
  return (credential, metadata)
}


// The main function
@available(iOS 17.0, *)
func createAssertionFromTempPasskey(
  item: TempPasskeyItem,
  requestParams: ASPasskeyCredentialRequestParameters
) throws -> ASPasskeyAssertionCredential {
  print("➡️ rpId (item):", item.rpId, "credentialId ", item.credentialId, "userId ", item.userId, "alg :", item.alg)
  print("  rpId (request):", requestParams.relyingPartyIdentifier)
  print("  allowedCredentials count:", requestParams.allowedCredentials.count)
  print("  userVerificationPreference:", requestParams.userVerificationPreference.rawValue)
  print("  clientDataHash length (bytes):", requestParams.clientDataHash.count)
  
  // 1) Basic RP check
  guard item.rpId == requestParams.relyingPartyIdentifier else {
    throw NSError(domain: "Passkey", code: -1, userInfo: [NSLocalizedDescriptionKey: "RP mismatch"])
  }
  
  // 2) Credential ID, userHandle, privatekey Data
  guard let credId = Data(base64URLEncoded: item.credentialId),
        let userHandle =  Data(base64URLEncoded: item.userId),
        let privData = Data(base64URLEncoded: item.privateKey)
  else {
    throw NSError(domain: "Passkey", code: -2, userInfo: [NSLocalizedDescriptionKey: "Invalid credentialId, userId, privateKey encoding"])
  }
  
  
  // 3) Attempt direct import privateKey
  let keyType = (item.alg == -7) ? kSecAttrKeyTypeECSECPrimeRandom : kSecAttrKeyTypeRSA
  let keySize = (item.alg == -7) ? 256 : 2048
  var importOptions: [String: Any] = [
    kSecAttrKeyType as String: keyType,
    kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
    kSecAttrKeySizeInBits as String: keySize,
  ]
  var cfErr: Unmanaged<CFError>?
  var signingKey: SecKey? = SecKeyCreateWithData(privData as CFData, importOptions as CFDictionary, &cfErr)
  if signingKey == nil {
    print("  ⚠️ SecKeyCreateWithData failed:", cfErr?.takeRetainedValue() as Any)
    if item.alg == -257 {
      // Try wrap PKCS#1 -> PKCS#8 for RSA private key and re-import
      print("  Attempting PKCS#1 -> PKCS#8 wrap for RSA private key")
      let wrapped = wrapRSAPKCS1ToPKCS8(privData)
      cfErr = nil
      signingKey = SecKeyCreateWithData(wrapped as CFData, importOptions as CFDictionary, &cfErr)
      if signingKey != nil {
        print("  ✅ Re-import succeeded after wrapping PKCS#1 -> PKCS#8")
      } else {
        print("  ❌ Re-import after wrap failed:", cfErr?.takeRetainedValue() as Any)
      }
    } else {
      // Optionally: attempt to wrap EC raw into PKCS#8 if you know format — omitted here
      print("  No fallback available for EC import in this helper (you may need PKCS#8/SEC1 encoding)")
    }
  } else {
    print("  ✅ SecKeyCreateWithData succeeded (private key imported)")
  }
  
  guard let privateKey = signingKey else {
    throw NSError(domain: "Passkey", code: -5, userInfo: [NSLocalizedDescriptionKey: "Failed to import private key; expected DER PKCS#8 or wrapped PKCS#1 for RSA"])
  }
  
  
  // 4) Build authenticatorData for assertion: rpIdHash(32) + flags(1) + signCount(4)
  let rpIdHash = Data(SHA256.hash(data: requestParams.relyingPartyIdentifier.data(using: .utf8)!))
  var flags: UInt8 = 0x01 | 0x08 | 0x10  // UP + BE + BS
  // set UV bit if requestParams requires user verification (optional)
  if requestParams.userVerificationPreference == .required {
    flags |= 0x04
  }
  let signCount: [UInt8] = [0,0,0,0]
  var authData = Data()
  authData.append(rpIdHash)
  authData.append(flags)
  authData.append(contentsOf: signCount)
  print("  authData len:", authData.count, "hex prefix:", authData.prefix(48).toHex())
  
  // 6) Build message to sign = authenticatorData || clientDataHash (the system provided clientDataHash)
  var messageToSign = Data()
  messageToSign.append(authData)
  messageToSign.append(requestParams.clientDataHash) // already a SHA-256 of clientDataJSON
  print("  messageToSign len:", messageToSign.count, "clientDataHash len:", requestParams.clientDataHash.count)
  
  
  // 7) Sign using SecKey (use message variant so SecKey does the hashing)
  let algorithm: SecKeyAlgorithm = {
    switch item.alg {
    case -7:   return .ecdsaSignatureMessageX962SHA256   // ES256
     case -257: return .rsaSignatureMessagePKCS1v15SHA256 // RS256
     default:   return .ecdsaSignatureMessageX962SHA256
    }
  }()
  guard SecKeyIsAlgorithmSupported(privateKey, .sign, algorithm) else {
    print("❌ Signing algorithm not supported by key")
    throw NSError(domain: "Passkey", code: -6, userInfo: [NSLocalizedDescriptionKey: "Signing algorithm not supported by key"])
  }
  
  cfErr = nil
  guard let signature = SecKeyCreateSignature(privateKey, algorithm, messageToSign as CFData, &cfErr) as Data? else {
    print("❌ SecKeyCreateSignature failed:", cfErr?.takeRetainedValue() as Any)
    throw NSError(domain: "Passkey", code: -7, userInfo: [NSLocalizedDescriptionKey: "Signature generation failed"])
  }


  // 8) build and return ASPasskeyAssertionCredential
  let assertion = ASPasskeyAssertionCredential(
    userHandle: userHandle,
    relyingParty: requestParams.relyingPartyIdentifier,
    signature: signature,
    clientDataHash: requestParams.clientDataHash,
    authenticatorData: authData,
    credentialID: credId
  )
  
  print("✅ Created ASPasskeyAssertionCredential — returning to system")
  return assertion
}


fileprivate func wrapRSAPKCS1ToPKCS8(_ privPKCS1: Data) -> Data {
  // Wrap PKCS#1 RSAPrivateKey into PKCS#8 PrivateKeyInfo (ASN.1)
  // Minimal wrapper for typical keys. See earlier message for explanation.
  let oidRSA: [UInt8] = [0x2a,0x86,0x48,0x86,0xf7,0x0d,0x01,0x01,0x01] // 1.2.840.113549.1.1.1
  let algSeq: [UInt8] = [0x30, 0x0d, 0x06, 0x09] + oidRSA + [0x05, 0x00]
  let pkcs1Len = privPKCS1.count
  
  var octetHeader: [UInt8] = []
  if pkcs1Len < 24 {
    octetHeader.append(0x04 | UInt8(pkcs1Len))
  } else if pkcs1Len <= 0xFF {
    octetHeader += [0x04, 0x58, UInt8(pkcs1Len)]
  } else {
    octetHeader += [0x04, 0x59, UInt8((pkcs1Len >> 8) & 0xff), UInt8(pkcs1Len & 0xff)]
  }
  
  let innerLen = algSeq.count + octetHeader.count + pkcs1Len
  var innerHeader: [UInt8] = []
  if innerLen < 128 {
    innerHeader = [0x30, UInt8(innerLen)]
  } else if innerLen <= 0xFF {
    innerHeader = [0x30, 0x81, UInt8(innerLen)]
  } else {
    innerHeader = [0x30, 0x82, UInt8((innerLen>>8)&0xff), UInt8(innerLen&0xff)]
  }
  
  let versionBytes: [UInt8] = [0x02, 0x01, 0x00] // INTEGER 0
  let totalLen = versionBytes.count + innerHeader.count + innerLen
  var totalHeader: [UInt8] = []
  if totalLen < 128 {
    totalHeader = [0x30, UInt8(totalLen)]
  } else if totalLen <= 0xFF {
    totalHeader = [0x30, 0x81, UInt8(totalLen)]
  } else {
    totalHeader = [0x30, 0x82, UInt8((totalLen>>8)&0xff), UInt8(totalLen&0xff)]
  }
  
  var out = Data()
  out.append(contentsOf: totalHeader)
  out.append(contentsOf: versionBytes)
  out.append(contentsOf: innerHeader)
  out.append(contentsOf: algSeq)
  out.append(contentsOf: octetHeader)
  out.append(privPKCS1)
  return out
}
