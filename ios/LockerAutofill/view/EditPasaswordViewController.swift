//
//  EditPasaswordViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 03/12/2021.
//

import UIKit

class EditPasaswordViewController: UIViewController {

  
  
  @IBOutlet weak var nameLabel: UILabel!
  
  
  @IBOutlet weak var username: CustomTextField!
  @IBOutlet weak var password: CustomTextField!
  
  @IBOutlet weak var uriLabel: UILabel!
  
  
  var credential: [String:String]!
  
  override func viewDidLoad() {
      super.viewDidLoad()
    
    self.nameLabel.text = credential["name"]
    
    self.username.text = credential["username"]
    self.uriLabel.text = credential["uri"]
    self.password.text = credential["password"]
    
    //disable input text field
    self.username.isUserInteractionEnabled = false
    self.password.isUserInteractionEnabled = false
  }
  @IBAction func cancel1(_ sender: Any) {
    dismiss(animated: true, completion: nil)
  }
  
}
