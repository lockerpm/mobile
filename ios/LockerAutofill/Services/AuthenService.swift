//
//  AuthenService.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import Foundation
import CommonCrypto
import LocalAuthentication
import UIKit

let authenService = AuthenService()

struct AuthenService {
  func biometricAuthentication(view: UIViewController, onSuccess: @escaping () -> Void, onFailed: @escaping () -> Void, notSupported: @escaping () -> Void ) {
    let context = LAContext()
    var error: NSError? = nil
    
    // check for device support biometric authen
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      let reason = i.translate("utils.touchID")
      
      context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                             localizedReason: reason) {success, authenError in
        DispatchQueue.main.async {
          guard success, authenError == nil else {
            //failed, can not use biometric for auth
            onFailed()
            return
          }
          //success
          onSuccess()
        }
      }
    } else {
      // can not use biometric for auth
      noti(contex: view, title: i.translate("utils.disableBiometric"), message: i.translate("utils.unconfigBiometric"),  completion: notSupported)
      
    }
  }
  
  func biometricAuthentication(onSuccess: @escaping () -> Void, onFailed: @escaping () -> Void) {
    let context = LAContext()
    var error: NSError? = nil
    
    // check for device support biometric authen
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      let reason = i.translate("utils.touchID")
      
      context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                             localizedReason: reason) {success, authenError in
        DispatchQueue.main.async {
          guard success, authenError == nil else {
            //failed, can not use biometric for auth
            onFailed()
            return
          }
          //success
          onSuccess()
        }
      }
    }
  }
  
  func makeKeyHash(masterPassword: String, email: String) -> String{
    let key =  pbkdf2SHA256(password: masterPassword, salt: email, keyByteCount: KEY_BYTE_COUNT, rounds: DEFAULT_ROUNDS) ?? ""

    let localKeyHashAutofill = pbkdf2SHA256(password: key, salt: masterPassword, keyByteCount: KEY_BYTE_COUNT, rounds: AUTOFILL_AUTHENTICATION_ROUNDS)
    return localKeyHashAutofill ?? ""
  }

  
  private let KEY_BYTE_COUNT = 32
  private let DEFAULT_ROUNDS  = 100000
  private let AUTOFILL_AUTHENTICATION_ROUNDS = 3

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

