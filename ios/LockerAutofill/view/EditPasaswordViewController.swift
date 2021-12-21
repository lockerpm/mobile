//
//  EditPasaswordViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 03/12/2021.
//

import UIKit
import Toast

class EditPasaswordViewController: UIViewController {

  var isHidePassword: Bool = true
  
  @IBOutlet weak var nameLabel: UILabel!
  @IBOutlet weak var uriLabel: UILabel!
  
  @IBOutlet weak var username: CustomTextField!
  @IBOutlet weak var password: CustomTextField!
  
  @IBOutlet weak var usernameCopyButton: UIButton!
  @IBOutlet weak var passCopyButton: UIButton!
  
  @IBOutlet weak var hidePasswordIconButton: UIButton!
  
  @IBOutlet weak var deleteButton: UIButton!
  
  var credential: PasswordCredential!
  let mediumConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .light, scale: .medium)
  override func viewDidLoad() {
      super.viewDidLoad()
//    NotificationCenter.default.addObserver(self, selector: #selector(<#T##@objc method#>), name: Notification.Name("deleted"), object: nil)

    self.nameLabel.text = credential.name
    self.username.text = credential.username
    self.uriLabel.text = credential.uri
    self.password.text = credential.password
    
    
    //disable input text field
    self.username.isUserInteractionEnabled = false
    self.password.isUserInteractionEnabled = false
    
    // Unable to delete credentials that the user does not own
    if ( !credential.isOwner ) {
      self.deleteButton.isEnabled = false
    }
    
    
    hidePasswordIconButton.setImage(UIImage(systemName: "eye", withConfiguration: mediumConfig), for: .normal)
  }
  @IBAction func cancel1(_ sender: Any) {
    dismiss(animated: true, completion: nil)
  }
  
//  @objc func didGetNotification(_ notification: Notification){
//    let text
//  }
  @IBAction func eyeIconDidPress(_ sender: Any) {
    isHidePassword = !isHidePassword
    password.isSecureTextEntry = !password.isSecureTextEntry

    if isHidePassword {
      hidePasswordIconButton.setImage(UIImage(systemName: "eye", withConfiguration: mediumConfig), for: .normal)
    } else {
      hidePasswordIconButton.setImage(UIImage(systemName: "eye.slash", withConfiguration: mediumConfig), for: .normal)
    }
  }
  @IBAction func passwordCopyDidPress(_ sender: Any) {
    UIPasteboard.general.string = password.text
    self.view.makeToast("password copied", duration: 1.5, position: .top)
  }
  @IBAction func usernameCopyDidPress(_ sender: Any) {
    UIPasteboard.general.string = username.text
    self.view.makeToast("username copied", duration: 1.5, position: .top)
  }
  
  
  @IBAction func deleteCredential(_ sender: Any) {
    let itemName: String = credential.name ?? ""
    let refreshAlert = UIAlertController(title: "Delete Item", message: "Item “\(itemName)” is about to be deleted from your vault.", preferredStyle: UIAlertController.Style.alert)

    refreshAlert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { (action: UIAlertAction!) in
          print("Cancel delete")
    }))
    refreshAlert.addAction(UIAlertAction(title: "Delete", style: .destructive, handler: { (action: UIAlertAction!) in
        credentialIdStore.removeCredential(credential: self.credential)
        NotificationCenter.default.post(name: Notification.Name("deleted"), object: nil)
        self.dismiss(animated: true, completion: nil)
    }))

    present(refreshAlert, animated: true, completion: nil)
  }
  
}
