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
import Argon2Swift

let authenService = AuthenService()

private enum AuthenServiceError: Error {
  case invalidKdfConfig
  case keyDerivationFailed(Int32)
}

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
      notSupported()
      // can not use biometric for auth
//      noti(contex: view, title: i.translate("utils.disableBiometric"), message: i.translate("utils.unconfigBiometric"),  completion: notSupported)
      
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
  
  func makeKeyHash(
    masterPassword: String,
    email: String,
    config: MPEncodeConfig
  ) async throws -> String {
    try await Task.detached(priority: .userInitiated) {
      try Self.makeKeyHashSync(
        masterPassword: masterPassword,
        email: email,
        config: config
      )
    }.value
  }

  private static let keyByteCount = 32
  private static let autofillAuthenticationRounds = 3

  private static func makeKeyHashSync(
    masterPassword: String,
    email: String,
    config: MPEncodeConfig
  ) throws -> String {
    guard config.isValid else {
      throw AuthenServiceError.invalidKdfConfig
    }

    let masterKey: Data
    switch config.kdf {
    case .pbkdf2SHA256:
      masterKey = try pbkdf2SHA256(
        password: masterPassword,
        salt: email,
        keyByteCount: keyByteCount,
        rounds: config.iterations
      )
    case .argon2id:
      let result = try Argon2Swift.hashPasswordString(
        password: masterPassword,
        salt: Salt(bytes: Data(email.utf8)),
        iterations: config.iterations,
        memory: config.memory,
        parallelism: config.parallelism,
        length: keyByteCount,
        type: .id,
        version: .V13
      )
      masterKey = result.hashData()
    }

    return try pbkdf2SHA256(
      password: masterKey.base64EncodedString(),
      salt: masterPassword,
      keyByteCount: keyByteCount,
      rounds: autofillAuthenticationRounds
    ).base64EncodedString()
  }

  private static func pbkdf2SHA256(
    password: String,
    salt: String,
    keyByteCount: Int,
    rounds: Int
  ) throws -> Data {
    guard rounds > 0 && UInt64(rounds) <= UInt64(UInt32.max) else {
      throw AuthenServiceError.invalidKdfConfig
    }

    let passwordData = Data(password.utf8)
    let saltData = Data(salt.utf8)
    var derivedKeyData = Data(repeating: 0, count: keyByteCount)

    let derivationStatus: Int32 = derivedKeyData.withUnsafeMutableBytes { derivedKeyBytes in
      saltData.withUnsafeBytes { saltBytes in
        passwordData.withUnsafeBytes { passwordBytes in
          CCKeyDerivationPBKDF(
            CCPBKDFAlgorithm(kCCPBKDF2),
            passwordBytes.bindMemory(to: Int8.self).baseAddress,
            passwordData.count,
            saltBytes.bindMemory(to: UInt8.self).baseAddress,
            saltData.count,
            CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256),
            UInt32(rounds),
            derivedKeyBytes.bindMemory(to: UInt8.self).baseAddress,
            keyByteCount
          )
        }
      }
    }

    guard derivationStatus == kCCSuccess else {
      throw AuthenServiceError.keyDerivationFailed(derivationStatus)
    }
    return derivedKeyData
  }
}
