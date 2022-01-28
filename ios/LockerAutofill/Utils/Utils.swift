//
//  Utils.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//

import Foundation
import AuthenticationServices
import Toast
import LocalAuthentication

class Utils {
  static private let pbkdf2: HashCore = HashCore()
  
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
  
  static public func CredentialIdentityStoreEnabled() async -> Bool {
    let state = await ASCredentialIdentityStore.shared.state()
    return state.isEnabled
  }
  
  static public func AddCredentialsQuickTypeBar(identifier: String, type: Int = 0, user: String, recordIdentifier: String){
    Task.init {
      let state =  await CredentialIdentityStoreEnabled()
      if (state) {
        let credential = ASPasswordCredentialIdentity(
          serviceIdentifier: ASCredentialServiceIdentifier(
            identifier: identifier,
            type: (type == 0) ? .domain : .URL),
            user: user,
            recordIdentifier: recordIdentifier
        )
        credential.rank = Utils.CurrentTimeInMilliSeconds()

        ASCredentialIdentityStore.shared.saveCredentialIdentities([credential]) { bool, error in
            if let error = error {
                print(error)
            } else {
                print("Saved Credential!")
            }
        }
      }
    }
  }
  
  static public func RemoveCredentialIdentities(_ credentialIdentities: ASPasswordCredentialIdentity){
    Task.init {
      let state =  await CredentialIdentityStoreEnabled()
      if (state) {
        ASCredentialIdentityStore.shared.removeCredentialIdentities([credentialIdentities]) { bool, error in
            if let error = error {
                print(error)
            } else {
                print("Remove Credential!")
            }
        }
      }
    }
  }
  
  static public func ReplaceCredentialIdentities(identifier: String, type: Int = 0, user: String, recordIdentifier: String) {
    Task.init {
      let state =  await CredentialIdentityStoreEnabled()
      if (state) {
        let credential = ASPasswordCredentialIdentity(
          serviceIdentifier: ASCredentialServiceIdentifier(
            identifier: identifier,
            type: (type == 0) ? .domain : .URL),
            user: user,
            recordIdentifier: recordIdentifier
        )
        credential.rank = Utils.CurrentTimeInMilliSeconds()

        ASCredentialIdentityStore.shared.saveCredentialIdentities([credential]) { bool, error in
            if let error = error {
                print(error)
            } else {
                print("Replace Credential!")
            }
        }
      }
    }
  }
  
  static public func RemoveAllCredentialIdentities() {
    Task.init {
      let state =  await CredentialIdentityStoreEnabled()
      if (state) {
        ASCredentialIdentityStore.shared.removeAllCredentialIdentities({ bool, error in
            if let error = error {
                print(error)
            } else {
                print("Remove Credential!")
            }
        })
      }
    }
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

