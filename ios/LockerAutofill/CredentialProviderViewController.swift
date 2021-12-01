//
//  CredentialProviderViewController.swift
//  LockerAutofill
//
//  Created by duchm on 14/10/2021.
//

import AuthenticationServices



class CredentialProviderViewController: ASCredentialProviderViewController, UISearchBarDelegate, UITableViewDataSource, UITableViewDelegate{
  
  
    @IBOutlet weak var searchBar: UISearchBar!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var uriNotification: UILabel!
  
  
    var credentialIdStore: CredentialIdentityStore!
    var filterData:  [[String: String]] = []
   // var data:  [[String: String]] = []
    
  
  
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
    label.numberOfLines = 0
    label.lineBreakMode = .byWordWrapping
    return label
  }

  @objc func pressed(sender: UIButton) {
    let target = self.credentialIdStore.credentials[sender.tag]
    let passwordCredential = ASPasswordCredential(user: target["username"] ?? "", password: target["password"] ?? "")
    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
  }
 

  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
 // for search
    self.searchBar.delegate = self
    self.tableView.delegate = self
    self.tableView.dataSource = self
    
      
    // Get uri
    var uri = ""
    if serviceIdentifiers.count > 0 {
      uri = serviceIdentifiers[0].identifier
    }
    
    // get audofill data from shared keychain suitable with uri
    self.credentialIdStore = CredentialIdentityStore(uri)
    uriNotification.text = "Choose a password to use for \"\(self.credentialIdStore.URI)\""
    uriNotification.font = uriNotification.font?.withSize(CGFloat(14))
    //clear stackView
    
    self.filterData = self.credentialIdStore.credentials
    tableView.reloadData()
    
//
//    if credentialIdStore.credentials.count > 0 {
//      //   label
//      let label = makeLabel(text: "Credentials for \(credentialIdStore.URI)\n", size: 20)
//      label.textAlignment = .left
//      self.stackView.addArrangedSubview(label)
//      self.stackView.setCustomSpacing(CGFloat(5), after: label)
//
//      // add credential items
//      for (index, item) in self.credentialIdStore.credentials.enumerated() {
//          let btn = self.makeButton(title: item["username"] ?? "", index: index)
//          self.stackView.addArrangedSubview(btn)
//      }
//      return
//    }
//
//    // No password available
//    let label = makeLabel(text: "There are no passwords available for this uri. Add a password to Locker to start using autofill feature.", size: 16)
//    label.frame = CGRect(x: 16, y: 0, width: UIScreen.main.bounds.size.width-60, height: 100.0)
//    label.textAlignment = .center
//    self.stackView.addSubview(label)
    //stackView.alignment = .center
  }


  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return self.filterData.count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: "cell")! as UITableViewCell
    
    cell.textLabel?.text = self.filterData[indexPath.row]["username"]

    return cell
  }
  func numberOfSections(in tableView: UITableView) -> Int {
    
    // #warning Incomplete implementation, return the number of sections
    return 1
  }
  
  //mark search bar config
  func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
    filterData = []
    if searchText == "" {
      filterData = credentialIdStore.credentials
    }
    for credential in credentialIdStore.credentials {
      let username: String = credential["username"]!.lowercased()
      if username.contains(searchText.lowercased()) {
          filterData.append(credential)
      }
    }
     self.tableView.reloadData()
  }
    
    @IBAction func cancel(_ sender: AnyObject?) {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
  }
  
  // move to Add pass screen
  @IBAction func add() {

    let addPassView = storyboard?.instantiateViewController(withIdentifier: "AddNewPasswordView") as! NewPasswordViewController
//    addPassView.completionHandler = {text1, text2 in
//      print(text1, text2)
//    }
    present(addPassView, animated: true)
  }
  
  @IBAction func addNewPassword(_ sender: Any) {
    add()
  }
}


