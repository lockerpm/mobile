//
//  NewPasswordViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 26/11/2021.
//

import UIKit


class NewPasswordViewController:  CredentialProviderViewController {


  
  @IBOutlet weak var saveNavBarButton: UIBarButtonItem!
  @IBOutlet weak var saveBottomButton: UIButton!
  @IBOutlet weak var uriField: CustomTextField!
  @IBOutlet weak var passwordField: CustomTextField!
  @IBOutlet weak var usernameField: CustomTextField!
  @IBOutlet weak var nameField: CustomTextField!
  //send data back to credential view
  public var completionHandler: ((String?, String?) -> Void)?
  
  override func viewDidLoad() {
        super.viewDidLoad()
    
    self.uriField.text = newPassword.uri
    disableSaveButton()
    passwordField.addTarget(self, action: #selector(passwordFieldDidChange), for: .editingChanged)
    nameField.addTarget(self, action: #selector(nameFieldDidChange), for: .editingChanged)
    uriField.addTarget(self, action: #selector(uriFieldDidChange), for: .editingChanged)
  }
  func disableSaveButton() {
    let username: String = usernameField.text!
    let password: String = passwordField.text!
    let uri: String = uriField.text!
    if uri == "" || username == "" || password == "" {
      self.saveBottomButton.isEnabled = false
      self.saveNavBarButton.isEnabled = false
    }
    else {
      self.saveBottomButton.isEnabled = true
      self.saveNavBarButton.isEnabled = true
    }
  }
  @objc func passwordFieldDidChange(_ textField: UITextField) {
    self.disableSaveButton()
  }
  @objc func nameFieldDidChange(_ textField: UITextField) {
    self.disableSaveButton()
  }
  @objc func uriFieldDidChange(_ textField: UITextField) {
    self.disableSaveButton()
  }
    

  @IBAction func cancel1(_ sender: Any) {
    dismiss(animated: true, completion: nil)
  }
  @IBAction func saveButtonDidPress(_ sender: Any) {
    newPassword.password = passwordField.text!
    newPassword.username = usernameField.text!
    newPassword.uri = uriField.text!
    
    //dismiss(animated: true, completion: nil)
    completeRequest(user: newPassword.password, password: newPassword.username)
  }
}


