//
//  VerifyMasterPasswordViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 21/01/2022.
//


import UIKit
import LocalAuthentication



protocol VerifyMasterPasswordDelegate {
  var userAvatar: String! {get}
  var userEmail: String! {get}
  var hassMasterPass: String! {get}
  var authenQuickBar: Bool {get}
  var faceidEnabled: Bool {get}
  
  func cancel()
  func authenSuccess()
  func quickBarAuthenSuccess()
}

class VerifyMasterPasswordViewController: UIViewController {
  var delegate: VerifyMasterPasswordDelegate!
 
  @IBOutlet weak var unlockBtn: UIButton!
  @IBOutlet weak var emailView: UIView!
  @IBOutlet weak var masterPassword: FormFieldView!
  
  override func viewDidLoad() {
    super.viewDidLoad()
//    isModalInPresentation = true //disable the pull-down gesture
   
    masterPassword.setLabel(label: Utils.Translate("Password"), passwordField: true)
    makeEmailView()
  }
 
  @IBAction func cancel(_ sender: AnyObject?) {
    cancel()
  }
  
  @IBAction func unlockDidPress(_ sender: Any) {
    let masterPass = self.masterPassword.textField.text!
    if (verifyMasterPassword(masterPass: masterPass)) {
      authenSuccess()
    } else {
      cancel()
    }
  }
  
  @IBAction func faceIdDidPress(_ sender: Any) {
    if (delegate.faceidEnabled){
      Utils.BiometricAuthentication(view: self, onSuccess: authenSuccess, onFailed: cancel)
    }
    else {
      Utils.Noti(contex: self, title: "Face ID is Not Available", message: "Please enable Faceid/TouchId in Locker to use this feature.")
    }
  }
  
  private func verifyMasterPassword(masterPass: String) -> Bool {
    let hash = Utils.MakeKeyHash(key: masterPass, text: delegate.userEmail)
    if hash == delegate.hassMasterPass {
      return true
    }
    return false
  }
  
  private func authenSuccess(){
    dismiss(animated: true, completion: nil)
    if (delegate.authenQuickBar){
      delegate.quickBarAuthenSuccess()
    } else {
      delegate.authenSuccess()
    }
    
  }
  private func cancel() {
    dismiss(animated: true, completion: nil)
    delegate.cancel()
  }
}

extension VerifyMasterPasswordViewController {
  private func makeEmailView(){
    if (delegate == nil){
      return
    }
    let firstCharacter = UILabel()
    let avatar = UIImageView()
    let emailBackground = UIView()
    let email = UILabel()
    
    emailBackground.translatesAutoresizingMaskIntoConstraints = false
    emailBackground.backgroundColor = UIColor(named: "block")
    emailBackground.layer.cornerRadius = 20
    
    avatar.translatesAutoresizingMaskIntoConstraints = false
    avatar.downloaded(from: delegate.userAvatar )
    avatar.layer.masksToBounds = true
    avatar.layer.cornerRadius = 14

    
    firstCharacter.translatesAutoresizingMaskIntoConstraints = false
    firstCharacter.textColor = UIColor(named: "white")
    firstCharacter.font = UIFont.boldSystemFont(ofSize: 20)
    let index = delegate.userEmail.index(delegate.userEmail.startIndex, offsetBy: 0)
    firstCharacter.text = String(delegate.userEmail[index]).uppercased()
 
    email.translatesAutoresizingMaskIntoConstraints = false
    email.font = email.font.withSize(14)
    email.tintColor = UIColor(named: "title")
    email.text = delegate.userEmail
    
 
    emailView.addSubview(emailBackground)
    emailView.addSubview(avatar)
    emailView.addSubview(firstCharacter)
    emailView.addSubview(email)
    
    NSLayoutConstraint.activate([
        // textfield
      emailBackground.centerXAnchor.constraint(equalTo: emailView.centerXAnchor),
      emailBackground.bottomAnchor.constraint(equalTo: emailView.bottomAnchor),
      emailBackground.topAnchor.constraint(equalTo: emailView.topAnchor),
      
      emailBackground.trailingAnchor.constraint(equalTo: email.trailingAnchor, constant: 12),
      
      avatar.leadingAnchor.constraint(equalTo: emailBackground.leadingAnchor, constant: 4),
      avatar.bottomAnchor.constraint(equalTo: emailBackground.bottomAnchor, constant: -4),
      avatar.topAnchor.constraint(equalTo: emailBackground.topAnchor, constant: 4),
      avatar.widthAnchor.constraint(equalToConstant: 28),
      avatar.heightAnchor.constraint(equalToConstant: 28),
      
      email.leadingAnchor.constraint(equalTo: avatar.trailingAnchor, constant: 10),
      email.centerYAnchor.constraint(equalTo: emailView.centerYAnchor),
   
      firstCharacter.centerXAnchor.constraint(equalTo: avatar.centerXAnchor),
      firstCharacter.centerYAnchor.constraint(equalTo: avatar.centerYAnchor)
    ])
  }
}

extension UIImageView {
    func downloaded(from url: URL, contentMode mode: ContentMode = .scaleAspectFit) {
        contentMode = mode
        URLSession.shared.dataTask(with: url) { data, response, error in
            guard
                let httpURLResponse = response as? HTTPURLResponse, httpURLResponse.statusCode == 200,
                let mimeType = response?.mimeType, mimeType.hasPrefix("image"),
                let data = data, error == nil,
                let image = UIImage(data: data)
                else { return }
            DispatchQueue.main.async() { [weak self] in
                self?.image = image
            }
        }.resume()
    }
    func downloaded(from link: String, contentMode mode: ContentMode = .scaleAspectFit) {
        guard let url = URL(string: link) else { return }
        downloaded(from: url, contentMode: mode)
    }
}
