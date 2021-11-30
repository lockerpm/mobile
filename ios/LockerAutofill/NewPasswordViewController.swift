//
//  NewPasswordViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 26/11/2021.
//

import UIKit

class NewPasswordViewController: UIViewController {

  @IBOutlet weak var label: UILabel!
  @IBOutlet weak var userName: UITextField!
  @IBOutlet weak var password: UITextField!
  
  //send data back to credential view
  public var completionHandler: ((String?, String?) -> Void)?
  
  override func viewDidLoad() {
        super.viewDidLoad()
        title = "Add Password"
        // Do any additional setup after loading the view.
    }
    

  @IBAction func cancel(_ sender: Any) {
    dismiss(animated: true, completion: nil)
  }
  @IBAction func donePress(_ sender: Any) {
    let user = userName.text
    let pass = password.text
    if user != nil || pass != nil {
      completionHandler?(user, pass)
      dismiss(animated: true, completion: nil)
    }
  }
}
