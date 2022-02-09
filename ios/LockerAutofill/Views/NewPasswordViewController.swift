//
//  NewPasswordViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 26/11/2021.
//

import UIKit
import AuthenticationServices

class NewPasswordViewController:  UIViewController {
  var loginListControllerDelegate: LoginListControllerDelegate!
  var uri: String!
  
  @IBOutlet weak var saveNavBarButton: UIBarButtonItem!
  @IBOutlet weak var saveBottomButton: UIButton!

  
  //send data back to credential view
  public var completionHandler: ((String?, String?) -> Void)?
  
  override func viewDidLoad() {
        super.viewDidLoad()
  }
 
}


