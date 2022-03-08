//
//  HashCore.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 24/01/2022.
//

import Foundation
import CommonCrypto

class HashCore {

  let KEY_BYTE_COUNT = 32
  let DEFAULT_ROUNDS  = 100000
  let AUTOFILL_AUTHENTICATION_ROUNDS = 3

  func makeKeyHash(masterPassword: String, email: String) -> String{
    let key =  pbkdf2SHA256(password: masterPassword, salt: email, keyByteCount: KEY_BYTE_COUNT, rounds: DEFAULT_ROUNDS) ?? ""

    let localKeyHashAutofill = pbkdf2SHA256(password: key, salt: masterPassword, keyByteCount: KEY_BYTE_COUNT, rounds: AUTOFILL_AUTHENTICATION_ROUNDS)
    return localKeyHashAutofill ?? ""
  }

  private func pbkdf2SHA256(password: String, salt: String, keyByteCount: Int, rounds: Int) -> String? {
    return pbkdf2(hash:CCPBKDFAlgorithm(kCCPRFHmacAlgSHA256), password:password, salt:salt, keyByteCount:keyByteCount, rounds:rounds)
  }
  
  private func pbkdf2(hash: CCPBKDFAlgorithm, password: String, salt: String, keyByteCount: Int, rounds: Int) -> String? {
      guard let passwordData = password.data(using: .utf8), let saltData = salt.data(using: .utf8) else { return nil }

      var derivedKeyData = Data(repeating: 0, count: keyByteCount)
      let derivedCount = derivedKeyData.count

      let derivationStatus = derivedKeyData.withUnsafeMutableBytes { derivedKeyBytes in
          saltData.withUnsafeBytes { saltBytes in
              CCKeyDerivationPBKDF(
                  CCPBKDFAlgorithm(kCCPBKDF2),
                  password,
                  passwordData.count,
                  saltBytes,
                  saltData.count,
                  hash,
                  UInt32(rounds),
                  derivedKeyBytes,
                  derivedCount)
          }
      }

      return derivationStatus == kCCSuccess ? derivedKeyData.base64EncodedString(options: NSData.Base64EncodingOptions(rawValue: 0)) : nil
  }
}

