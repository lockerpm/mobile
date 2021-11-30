//
//  CredentialProviderViewController.swift
//  LockerAutofill
//
//  Created by duchm on 14/10/2021.
//

import AuthenticationServices
import KeychainAccess


func toArray(text: String) -> [[String: String]]? {
  if let data = text.data(using: .utf8) {
    do {
      return try JSONSerialization.jsonObject(with: data, options: []) as? [[String:String]]
    } catch {
      print(error.localizedDescription)
    }
  }
  return []
}


class CredentialProviderViewController: ASCredentialProviderViewController {
  
  @IBOutlet weak var stackView: UIStackView!
  @IBOutlet weak var loading: UIActivityIndicatorView!
  var passwords: [[String: String]] = []
    
  func makeButton(title: String, index: Int) -> UIButton {
    var configuration = UIButton.Configuration.plain()
    configuration.buttonSize = .large
    
    let button = UIButton(configuration: configuration)
    button.tag = index
    button.setTitle(title, for: .normal)
    button.setTitleColor(.link, for: .normal)
    button.contentHorizontalAlignment = .left
    button.addTarget(self, action: #selector(pressed), for: .touchUpInside)
    return button
  }
  
  func makeLabel(text: String, size: Int, color: UIColor? = .label) -> UILabel {
    let label = UILabel()
    label.text = text
    label.font = label.font?.withSize(CGFloat(size))
    label.textColor = color
    return label
  }

  @objc func pressed(sender: UIButton) {
    let target = self.passwords[sender.tag]
    let passwordCredential = ASPasswordCredential(user: target["username"] ?? "", password: target["password"] ?? "")
    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
  }

  /*
   Prepare your UI to list available credentials for the user to choose from. The items in
   'serviceIdentifiers' describe the service the user is logging in to, so your extension can
   prioritize the most relevant credentials in the list.
  */
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    print("Debug")
    // Get uri
    var uri = ""
    print(serviceIdentifiers.count)
    print(serviceIdentifiers[0])
    if serviceIdentifiers.count > 0 {
      uri = serviceIdentifiers[0].identifier
    }
    print(uri)
    
    // Clear view
    self.stackView.subviews.forEach({ $0.removeFromSuperview() })
    
    // Get data from shared keychain
    let keychain = Keychain(service: "W7S57TNBH5.com.cystack.lockerapp", accessGroup: "group.com.cystack.lockerapp")
    let autofillData = try? keychain.get("autofill")
    print(autofillData!)
    
    // Has passwords
    if autofillData != nil {
      self.passwords = toArray(text: autofillData ?? "[]") ?? []
      print(self.passwords)
      if (self.passwords.count > 0) {
        var hasItem = false
        
        // Label
        let label = makeLabel(text: "Credentials for \(uri)\n", size: 20)
        label.textAlignment = .center
        self.stackView.addArrangedSubview(label)
        self.stackView.setCustomSpacing(CGFloat(15), after: label)
        
        // Buttons
        for (index, item) in self.passwords.enumerated() {
          let cipherUri = item["uri"] ?? ""
          print(cipherUri)
          if uri.isEmpty || uri.contains(cipherUri) {
            hasItem = true
            let btn = self.makeButton(title: item["username"] ?? "", index: index)
            self.stackView.addArrangedSubview(btn)
          }
        }
        
        if hasItem {
          return
        }
      }
    }
    
    // No password available
    let label = makeLabel(text: "There are no passwords available for this uri. Add a password to Locker to start using autofill feature.", size: 16)
    label.numberOfLines = 0
    self.stackView.addArrangedSubview(label)
  }

//
//   Implement this method if your extension supports showing credentials in the QuickType bar.
//   When the user selects a credential from your app, this method will be called with the
//   ASPasswordCredentialIdentity your app has previously saved to the ASCredentialIdentityStore.
//   Provide the password by completing the extension request with the associated ASPasswordCredential.
//   If using the credential would require showing custom UI for authenticating the user, cancel
//   the request with error code ASExtensionError.userInteractionRequired.
//
//  override func provideCredentialWithoutUserInteraction(for credentialIdentity: ASPasswordCredentialIdentity) {
//    
//     
//      let passwordCredential = ASPasswordCredential(user: "j_appleseed", password: "apple1234")
//      self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
//      
//  }
//  

  /*
   Implement this method if provideCredentialWithoutUserInteraction(for:) can fail with
   ASExtensionError.userInteractionRequired. In this case, the system may present your extension's
   UI and call this method. Show appropriate UI for authenticating the user then provide the password
   by completing the extension request with the associated ASPasswordCredential.

  override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
  }
  */

  @IBAction func cancel(_ sender: AnyObject?) {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
  }
  
  // move to Add pass screen
  @IBAction func add() {
    print("add")
    let addPassView = storyboard?.instantiateViewController(withIdentifier: "AddNewPasswordView") as! NewPasswordViewController
    addPassView.completionHandler = {text1, text2 in
      print(text1, text2)
    }
    present(addPassView, animated: true)
  }
//  @IBAction func addNewPassword(_ sender: Any) {
//    add()
//  }
}
