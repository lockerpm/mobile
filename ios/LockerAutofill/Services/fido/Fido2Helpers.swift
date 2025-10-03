//
//  Fido2Helper.swift
//  Locker
//
//  Created by Nguyen Thinh on 3/10/25.
//

import Foundation
import AuthenticationServices


func dataToStringWithoutPadding(_ data: Data) -> String {
  return data.base64EncodedString().trimmingCharacters(in: CharacterSet(charactersIn: "="))
}


// Select the first supported matching public key algorithm
// supported: [-7, -257],  prefer ES256 > RSA
func publicKeyAlgSelect(_ supportedAlgos: [ASCOSEAlgorithmIdentifier]) throws  -> Int {
  let serverAlgos = Set(supportedAlgos.map { $0.rawValue })
  let priority: [Int] = [-7, -257] // prefer ES256 > EdDSA > RSA
  guard let chosenAlg = priority.first(where: { serverAlgos.contains($0) }) else {
    throw NSError(domain: "Passkey", code: -2, userInfo: [NSLocalizedDescriptionKey: "No compatible algorithm"])
  }
  print("✅ Chosen algorithm: \(chosenAlg)")
  return chosenAlg
}

// ES256, P-256 cbor manual
// swiftCBOR encoding does not return as expected
// manual encode for this coseKey
// coseKey = [
//     CBOR.unsignedInt(1): CBOR.unsignedInt(2),       // kty: EC2
//     CBOR.unsignedInt(3): CBOR.negativeInt(7),       // alg: ES256
//     CBOR.negativeInt(1): CBOR.unsignedInt(1),       // crv: P-256
//     CBOR.negativeInt(2): CBOR.byteString(Array(xCoord)), // x
//     CBOR.negativeInt(3): CBOR.byteString(Array(yCoord)), // y
// ]
func es256CBOREncode(xCoord: [UInt8], yCoord: [UInt8]) -> Data {
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

// RS356 cbor encode
// coseKey = [
//    CBOR.unsignedInt(1): CBOR.unsignedInt(3),    // kty: RSA
//    CBOR.unsignedInt(3): CBOR.negativeInt(257),  // alg: RS256
//    CBOR.negativeInt(1): CBOR.byteString([UInt8](n)), // n
//    CBOR.negativeInt(2): CBOR.byteString([UInt8](e))  // e
// ]
func rs256CBOREncode(modulus: [UInt8], exponent: [UInt8]) -> Data {
    var cbor: [UInt8] = []
    cbor.append(0xa4)   // map(4)

    // 1: 3 (kty = RSA)
    cbor.append(0x01)   // key 1
    cbor.append(0x03)   // value 3

    // 3: -257 (alg = RS256)
    cbor.append(0x03)   // key 3
    // encode -257: CBOR negative int(N) = 0x20 + N, with N = (value * -1) - 1
    // here value = -257 → N = 256 → encoded as 0x39 0x01 0x00
    cbor.append(0x39)
    cbor.append(0x01)
    cbor.append(0x00)

    // -1: n (modulus)
    cbor.append(0x20)   // -1 as map key
    if modulus.count < 24 {
        cbor.append(0x40 | UInt8(modulus.count)) // short length
    } else if modulus.count <= 0xFF {
        cbor.append(0x58) // one-byte length
        cbor.append(UInt8(modulus.count))
    } else {
        // RSA modulus is usually 256 bytes (2048-bit)
        cbor.append(0x59) // two-byte length
        cbor.append(UInt8((modulus.count >> 8) & 0xff))
        cbor.append(UInt8(modulus.count & 0xff))
    }
    cbor.append(contentsOf: modulus)

    // -2: e (exponent)
    cbor.append(0x21)   // -2 as map key
    if exponent.count < 24 {
        cbor.append(0x40 | UInt8(exponent.count))
    } else {
        cbor.append(0x58)
        cbor.append(UInt8(exponent.count))
    }
    cbor.append(contentsOf: exponent)

    return Data(cbor)
}



// --- Access Control depending on UV preference ---
//  var accessControl: SecAccessControl? = nil
//  switch userVerification {
//  case .required:
//    flags |= 0x04
//    print("required control 111")
//    // enforce Face ID / Touch ID (or passcode fallback)
//    accessControl = SecAccessControlCreateWithFlags(
//      nil,
//      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
//      [.privateKeyUsage, .biometryCurrentSet],
//      nil
//    )
//  case .preferred:
//    print("preferred control 222")
//    // try biometrics if available, but not strictly required
//    accessControl = SecAccessControlCreateWithFlags(
//      nil,
//      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
//      [.privateKeyUsage, .userPresence],
//      nil
//    )
//  case .discouraged:
//    print("preferred control 333")
//    // no user verification – just key usage
//    accessControl = SecAccessControlCreateWithFlags(
//      nil,
//      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
//      [.privateKeyUsage],
//      nil
//    )
//  default:
//    accessControl = nil
//  }
