//
//  NewPasswordViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 26/11/2021.
//

import UIKit

class NewPasswordViewController: UIViewController {


  
  @IBOutlet weak var uriField: CustomTextField!
  @IBOutlet weak var passwordField: CustomTextField!
  @IBOutlet weak var usernameField: CustomTextField!
  @IBOutlet weak var nameField: CustomTextField!
  //send data back to credential view
  public var completionHandler: ((String?, String?) -> Void)?
  
  override func viewDidLoad() {
        super.viewDidLoad()
    self.uriField.text = newPassword.uri
  }
    

  @IBAction func cancel(_ sender: Any) {
    dismiss(animated: true, completion: nil)
  }
  @IBAction func donePress(_ sender: Any) {

   
     
    dismiss(animated: true, completion: nil)
    
  }
}
