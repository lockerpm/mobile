//
//  VerifyMasterPasswordViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 21/01/2022.
//


import UIKit
import LocalAuthentication
import Toast

class VerifyMasterPasswordViewController: UIViewController {
  var credentialProviderDelegate: CredentialProviderDelegate!
  var userEmail: String!
  var hassMasterPass: String!
  var authenQuickBar: Bool = false
  
  @IBOutlet weak var eyeIconButton: UIButton!
  @IBOutlet weak var masterPasswordTxt: UITextField!

  override func viewDidLoad() {
    super.viewDidLoad()
    isModalInPresentation = true //disable the pull-down gesture
    
    Utils.ToggleHidePass(text: masterPasswordTxt, eyeIcon: eyeIconButton, initial: true)
  }
 
  
  @IBAction func eyeIconDidPress(_ sender: Any) {
    Utils.ToggleHidePass(text: masterPasswordTxt, eyeIcon: eyeIconButton)
  }
 
  @IBAction func cancel(_ sender: AnyObject?) {
    cancel()
  }
  
  @IBAction func unlockDidPress(_ sender: Any) {
    let masterPass = self.masterPasswordTxt.text!
    if (verifyMasterPassword(masterPass: masterPass)) {
      authenSuccess()
    } else {
      cancel()
    }
  }
  
  @IBAction func faceIdDidPress(_ sender: Any) {
    if (credentialProviderDelegate.isFaceIdEnable()){
      Utils.BiometricAuthentication(view: self, onSuccess: authenSuccess, onFailed: cancel)
    }
    else {
      Utils.Noti(contex: self, title: "Face ID is Not Available", message: "Please enable Faceid/TouchId in Locker to use this feature.")
    }
  }
  
  
  private func verifyMasterPassword(masterPass: String) -> Bool {
    let hash = Utils.MakeKeyHash(key: masterPass, text: userEmail)
    if hash == hassMasterPass {
      return true
    }
    return false
  }
  
  private func authenSuccess(){
    dismiss(animated: true, completion: nil)
    
    if (authenQuickBar){
      self.credentialProviderDelegate.quickBarAuthenSuccess()
    } else {
      self.credentialProviderDelegate.authenSuccess()
    }
  }
  
  private func cancel() {
    dismiss(animated: true, completion: nil)
    self.credentialProviderDelegate.cancel()
  }
  
}

