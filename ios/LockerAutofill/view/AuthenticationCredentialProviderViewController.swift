//
//  AuthenticationCredentialProviderViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 07/12/2021.
//
import CommonCrypto
import LocalAuthentication
import AuthenticationServices


class AuthenticationCredentialProviderViewController: ASCredentialProviderViewController {
  var masterPassword: String = ""
  var isHidePassword: Bool = true
  
  let cipherStore = CoreAuthenticationCredentialProvider()
  
  @IBOutlet weak var eyeIconButton: UIButton!
  @IBOutlet weak var masterPasswordTxt: UITextField!
  @IBOutlet weak var faceIDButton: UIButton!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    // basic usage
    
    
    faceIDButton.contentHorizontalAlignment = .fill
    faceIDButton.contentVerticalAlignment = .fill
    faceIDButton.imageView?.contentMode = .scaleAspectFill
  }
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    // Get uri
    var uri = ""
    if serviceIdentifiers.count > 0 {
      uri = serviceIdentifiers[0].identifier
    }
    
    
    credentialIdStore = CredentialIdentityStore(uri)
    
    masterPasswordTxt.isSecureTextEntry = true
    let mediumConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .light, scale: .medium)
    eyeIconButton.setImage(UIImage(systemName: "eye", withConfiguration: mediumConfig), for: .normal)
    //faceIDButton.imageView?.contentMode = UIView.ContentMode.scaleAspectFit
    biometricAuthentication()
    
  }
  @IBAction func unlockDidPress(_ sender: Any) {
    //?? update later
    //authenSuccess()
    let masterPass = self.masterPasswordTxt.text!
    let passwordAuthen = credentialIdStore.getPasswordAuthen()
    if passwordAuthen == [:] {
      // failed
      return
    }
    let hashMasterPass = cipherStore.makeKeyHash(masterPassword: masterPass, email: passwordAuthen["email"]!)
    
    if hashMasterPass == passwordAuthen["hashPass"] {
        authenSuccess()
    } else {
      // failed
    }
    
  }
  @IBAction func biometricFaceIdDidPress(_ sender: Any) {
      biometricAuthentication()
  }
  
  func biometricAuthentication() {
    let context = LAContext()
    var error: NSError? = nil
    // check for device support biometric authen
    if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
      let reason = "Please authorize with Touch Id"
      context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                             localizedReason: reason) {[weak self] success, authenError in
        DispatchQueue.main.async {
          guard success, authenError == nil else {
              //failed
              // can not use biometric for auth
              let alert = UIAlertController(title: "Authentication Failed", message: "Please try again", preferredStyle: .alert)
              alert.addAction(UIAlertAction(title: "Dismiss", style: .cancel, handler: nil))
            
              self?.present(alert, animated: true)
              return
            }
            //show other screen
            //success
            self?.authenSuccess()
          }
        }
    } else {
      // can not use biometric for auth
      let alert = UIAlertController(title: "Biometry is Unvaliable", message: "Your device is not configured for biometric authentication", preferredStyle: .alert)
      alert.addAction(UIAlertAction(title: "Dismiss", style: .cancel, handler: nil))
      present(alert, animated: true)
    }
  }
  
  func authenSuccess(){
    let credentialProviderViewController = storyboard?.instantiateViewController(withIdentifier: "CredentialProviderViewController") as! CredentialProviderViewController

    present(credentialProviderViewController, animated: true)
    self.view = nil
  }
  
  @IBAction func cancel(_ sender: AnyObject?) {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
  }
  
  @IBAction func eyeIconDidPress(_ sender: Any) {
    isHidePassword = !isHidePassword
    masterPasswordTxt.isSecureTextEntry = !masterPasswordTxt.isSecureTextEntry
    
    let mediumConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .light, scale: .medium)
    if isHidePassword {
      eyeIconButton.setImage(UIImage(systemName: "eye", withConfiguration: mediumConfig), for: .normal)
    } else {
      eyeIconButton.setImage(UIImage(systemName: "eye.slash", withConfiguration: mediumConfig), for: .normal)
    }
  }
}


class CoreAuthenticationCredentialProvider {
  
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
