//
//  AuthenticationCredentialProviderViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 07/12/2021.
//

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
    
  }
  @IBAction func unlockDidPress(_ sender: Any) {
    let credentialProviderViewController = storyboard?.instantiateViewController(withIdentifier: "CredentialProviderViewController") as! CredentialProviderViewController

    present(credentialProviderViewController, animated: true)
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
}
