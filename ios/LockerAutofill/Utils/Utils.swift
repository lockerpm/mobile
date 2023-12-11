//
//  Utils.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//

import Foundation
import LocalAuthentication
import UIKit
import SwiftOTP

class Utils {

  static private let pbkdf2: HashCore = HashCore()
  
  static public func GetStringInfo(key: String) -> String {
    let a = Bundle.main.object(forInfoDictionaryKey: key) as? String
    return a ?? ""
  }
  static public func Translate(_ key: String) -> String {
    return key.locolized()
  }
  
  static public func LightTheme(_ view: UIViewController) -> Bool {
    if view.traitCollection.userInterfaceStyle == .light {
        return true
    }
    return false
  }
  
  static public func MakeKeyHash(key: String, text: String) -> String {
    return pbkdf2.makeKeyHash(masterPassword: key, email: text)
  }
  
  // ---- OTP -----
  static public func GetOTPAlgorithm(algr:String) -> OTPAlgorithm {
    switch algr {
     case "SHA1":
       return .sha1
     case "SHA256":
       return .sha256
     case "SHA512":
       return .sha512
     default:
       return .sha1
    }
  }
  static public func GetQueryParamValue(uri: String, query: String) -> String {
    let queryItems = URLComponents(string: uri)?.queryItems
    return queryItems?.filter({$0.name == query}).first?.value ?? ""
  }

  static public func GetOTPFromUri(uri: String) -> String {
    if uri.isEmpty {
      return ""
    }
    if !uri.contains("/") {
      let totp = TOTP(secret: Data(base32Decode(uri)!), digits: 6, timeInterval: 30, algorithm: .sha1)
      return totp?.generate(time: Date()) ?? ""
    }
    
    let secret: String = GetQueryParamValue(uri: uri, query: "secret")
    let algorithm: OTPAlgorithm = GetOTPAlgorithm(algr: GetQueryParamValue(uri: uri, query: "algorithm"))
    let timeInterval: Int = Int(GetQueryParamValue(uri: uri, query: "period")) ?? 30
    let digits: Int = Int(GetQueryParamValue(uri: uri, query: "digits")) ?? 6
  
    let totp = TOTP(secret: Data(base32Decode(secret)!), digits: digits, timeInterval: timeInterval, algorithm: algorithm)
      
    return totp?.generate(time: Date()) ?? ""
  }
  
  static public func BiometricAuthentication(view: UIViewController, onSuccess: @escaping () -> Void, onFailed: @escaping () -> Void) {
    let context = LAContext()
    var error: NSError? = nil

    // check for device support biometric authen
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      let reason = Translate("Please authorize with Touch Id")
      
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
      Noti(contex: view, title: Translate("Biometry is Unvaliable"), message: Translate("Your device is not configured for biometric authentication"),  completion: onFailed)
     
    }
  }

  
  static public func ToggleHidePass(text: UITextField, eyeIcon: UIButton, initial: Bool = false) -> Void{
    
    if (initial) {
      text.isSecureTextEntry = initial
    } else {
      text.isSecureTextEntry = !text.isSecureTextEntry
    }
  
//    let mediumConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .light, scale: .medium)
//    if text.isSecureTextEntry {
//      eyeIcon.setImage(UIImage(systemName: "eye", withConfiguration: mediumConfig), for: .normal)
//    } else {
//      eyeIcon.setImage(UIImage(systemName: "eye.slash", withConfiguration: mediumConfig), for: .normal)
//    }
  }
  
  static public func Noti(contex: UIViewController ,title: String, message: String, completion: (() -> Void)? = nil) -> Void {
    
    let log = {() -> () in print(message)}
    let alert = UIAlertController(title: Translate(title), message: Translate(message), preferredStyle: UIAlertController.Style.alert)

    alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { (action: UIAlertAction!) in
       (completion ?? log)()
    }))

    contex.present(alert, animated: true, completion:   nil)
  }
  static public func CurrentTimeInMilliSeconds()-> Int
  {
      let currentDate = Date()
      let since1970 = currentDate.timeIntervalSince1970
      return Int(since1970 * 1000)
  }

}

extension String {
    func locolized() -> String {
        return NSLocalizedString(
            self,
            tableName: "Localizable",
            bundle: .main,
            value: self,
            comment: self)
    }
}

extension UserDefaults {
  static let group = UserDefaults(suiteName: "group.net.vincss.passwordmanager")!
}
