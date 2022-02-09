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
  var credential: AutofillData!
  
  @IBOutlet weak var name: UILabel!
  @IBOutlet weak var uri: UILabel!
  @IBOutlet weak var username: FormFieldView!
  @IBOutlet weak var password: FormFieldView!
  @IBOutlet weak var ownedBy: UILabel!
  
  override func viewDidLoad() {
      super.viewDidLoad()
    uri.text = credential.uri
    name.text = credential.name
    username.setText(label: Utils.Translate("Email or username"), textField: credential.username, passwordField: false)
    password.setText(label: Utils.Translate("Password"), textField: credential.password, passwordField: true)
    ownedBy.text = credential.isOwner ? "Me" : "Another"
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
