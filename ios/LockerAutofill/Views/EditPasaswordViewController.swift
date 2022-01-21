//
//  EditPasaswordViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 03/12/2021.
//

import UIKit
import Toast

class EditPasaswordViewController: UIViewController {
  var loginListControllerDelegate: LoginListControllerDelegate!
  
  
  @IBOutlet weak var nameLabel: UILabel!
  @IBOutlet weak var uriLabel: UILabel!
  
  @IBOutlet weak var username: CustomTextField!
  @IBOutlet weak var password: CustomTextField!
  
  @IBOutlet weak var usernameCopyButton: UIButton!
  @IBOutlet weak var passCopyButton: UIButton!
  
  @IBOutlet weak var eyeIconButton: UIButton!
  @IBOutlet weak var deleteButton: UIButton!
  
  var credential: AutofillData!
  
  override func viewDidLoad() {
      super.viewDidLoad()

    self.nameLabel.text = credential.name
    self.username.text = credential.username
    self.uriLabel.text = credential.uri
    self.password.text = credential.password
    
    //disable input text field
    self.username.isUserInteractionEnabled = false
    self.password.isUserInteractionEnabled = false
    
    // Unable to delete login information that the user does not own
//    if ( !credential.isOwner ) {
//      self.deleteButton.isEnabled = false
//    }
    self.deleteButton.isEnabled = false
    
    
    Utils.ToggleHidePass(text: password, eyeIcon: eyeIconButton, initial: true)
  }
  
  @IBAction func cancel1(_ sender: Any) {
    dismiss(animated: true, completion: nil)
  }
  

  @IBAction func eyeIconDidPress(_ sender: Any) {
    Utils.ToggleHidePass(text: password, eyeIcon: eyeIconButton)
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
//    let itemName: String = credential.name ?? ""
//    let alert = UIAlertController(title: "Delete Item", message: "Item “\(itemName)” is about to be deleted from your vault.", preferredStyle: UIAlertController.Style.alert)
//
//    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { (action: UIAlertAction!) in
//          print("Cancel delete")
//    }))
//    alert.addAction(UIAlertAction(title: "Delete", style: .destructive, handler: { (action: UIAlertAction!) in
////        credentialIdStore.removeCredential(credential: self.credential)
//        print("delete")
////        NotificationCenter.default.post(name: Notification.Name("deleted"), object: nil)
//        self.dismiss(animated: true, completion: nil)
//    }))
//
//    present(alert, animated: true, completion: nil)
  }
}
