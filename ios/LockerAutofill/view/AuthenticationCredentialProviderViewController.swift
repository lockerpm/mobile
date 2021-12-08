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
  
  @IBOutlet weak var eyeIconButton: UIButton!
  @IBOutlet weak var masterPasswordTxt: UITextField!
  @IBOutlet weak var faceIDButton: UIButton!
  
  override func viewDidLoad() {
    super.viewDidLoad()
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
    
    //faceIDButton.imageView?.contentMode = UIView.ContentMode.scaleAspectFit
    biometricAuthentication()
    
  }
  @IBAction func unlockDidPress(_ sender: Any) {
    //?? update later
    authenSuccess()
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

    if isHidePassword {
      eyeIconButton.setImage(UIImage(systemName: "eye.slash"), for: .normal)
    } else {
      eyeIconButton.setImage(UIImage(systemName: "eye"), for: .normal)
    }
  }
  
  
  private func pbkdf2(password: String, saltData: Data, keyByteCount: Int, prf: CCPseudoRandomAlgorithm, rounds: Int) -> Data? {
      guard let passwordData = password.data(using: .utf8) else { return nil }
      var derivedKeyData = Data(repeating: 0, count: keyByteCount)
      let derivedCount = derivedKeyData.count
      let derivationStatus: Int32 = derivedKeyData.withUnsafeMutableBytes { derivedKeyBytes in
          let keyBuffer: UnsafeMutablePointer<UInt8> =
              derivedKeyBytes.baseAddress!.assumingMemoryBound(to: UInt8.self)
          return saltData.withUnsafeBytes { saltBytes -> Int32 in
              let saltBuffer: UnsafePointer<UInt8> = saltBytes.baseAddress!.assumingMemoryBound(to: UInt8.self)
              return CCKeyDerivationPBKDF(
                  CCPBKDFAlgorithm(kCCPBKDF2),
                  password,
                  passwordData.count,
                  saltBuffer,
                  saltData.count,
                  prf,
                  UInt32(rounds),
                  keyBuffer,
                  derivedCount)
          }
      }
      return derivationStatus == kCCSuccess ? derivedKeyData : nil
  }
}
