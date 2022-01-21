//
//  Utils.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//
import CommonCrypto
import Foundation
import AuthenticationServices
import Toast
import LocalAuthentication

class Utils {
  static private let pbkdf2: HashCore = HashCore()
  
  static public func MakeKeyHash(key: String, text: String) -> String {
    return pbkdf2.makeKeyHash(masterPassword: key, email: text)
  }
  
  static public func BiometricAuthentication(contex: UIViewController, authenSuccess: @escaping () -> Void) {
    let context = LAContext()
    var error: NSError? = nil

    // check for device support biometric authen
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      let reason = "Please authorize with Touch Id"
      
      context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                             localizedReason: reason) {[weak contex] success, authenError in
        DispatchQueue.main.async {
          guard success, authenError == nil else {
              //failed, can not use biometric for auth
              Noti(contex: contex!, title: "Authentication Failed", message: "Please try again")
              return
            }
            //success
            authenSuccess()
          }
        }
    } else {
      // can not use biometric for auth
      Noti(contex: contex, title: "Biometry is Unvaliable", message: "Your device is not configured for biometric authentication")
    }
  }
  
  static public func GetCipherUri(for serviceIdentifiers: [ASCredentialServiceIdentifier]) -> String {
    if serviceIdentifiers.count > 0 {
      return serviceIdentifiers[0].identifier
    }
    return ""
  }
  
  
  static public func ToggleHidePass(text: UITextField, eyeIcon: UIButton, initial: Bool = false) -> Void{
    
    if (initial) {
      text.isSecureTextEntry = initial
    } else {
      text.isSecureTextEntry = !text.isSecureTextEntry
    }
  
    let mediumConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .light, scale: .medium)
    if text.isSecureTextEntry {
      eyeIcon.setImage(UIImage(systemName: "eye", withConfiguration: mediumConfig), for: .normal)
    } else {
      eyeIcon.setImage(UIImage(systemName: "eye.slash", withConfiguration: mediumConfig), for: .normal)
    }
  }
  
  static public func Noti(contex: UIViewController ,title: String, message: String, completion: (() -> Void)? = nil) -> Void {
    
    let log = {() -> () in print(message)}
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertController.Style.alert)

    alert.addAction(UIAlertAction(title: "ok", style: .default, handler: { (action: UIAlertAction!) in
       (completion ?? log)()
    }))

    contex.present(alert, animated: true, completion:   nil)
  }

}


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

