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
    let mediumConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .light, scale: .medium)
    eyeIconButton.setImage(UIImage(systemName: "eye", withConfiguration: mediumConfig), for: .normal)
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
    
    let mediumConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .light, scale: .medium)
    if isHidePassword {
      eyeIconButton.setImage(UIImage(systemName: "eye", withConfiguration: mediumConfig), for: .normal)
    } else {
      eyeIconButton.setImage(UIImage(systemName: "eye.slash", withConfiguration: mediumConfig), for: .normal)
    }
  }
  
  
 
}
