//
//  CredentialProviderViewController.swift
//  LockerAutofill
//
//  Created by duchm on 14/10/2021.
//

import AuthenticationServices



class CredentialProviderViewController: ASCredentialProviderViewController {
  
    @IBOutlet weak var searchBar: UISearchBar!
    @IBOutlet weak var tableView: UITableView!
  
    
    var filterCredentials:  [[String: String]] = []
    var filterOthers: [[String: String]] = []
   // var data:  [[String: String]] = []
    

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
    credentialIdStore = CredentialIdentityStore(uri)
   
    //clear stackView
    self.filterCredentials = credentialIdStore.credentials
    self.filterOthers = credentialIdStore.otherCredentials
    tableView.reloadData()
    
    
    newPassword.uri = credentialIdStore.URI
  }
  func completeRequest(user: String, password: String){
    let passwordCredential = ASPasswordCredential(user: user, password: password)
    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
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
  
}


extension CredentialProviderViewController: UISearchBarDelegate {
  //mark search bar config, handle search function.
  func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
  
    filterCredentials = []
    filterOthers = []
    if searchText == "" {
      filterCredentials = credentialIdStore.credentials
      filterOthers = credentialIdStore.otherCredentials
    }
    // get matches credentiral username
    for credential in credentialIdStore.credentials {
      let username: String = credential["username"]!.lowercased()
      if username.contains(searchText.lowercased()) {
          filterCredentials.append(credential)
      }
    }
    // for ohters
    for credential in credentialIdStore.otherCredentials {
      let username: String = credential["username"]!.lowercased()
      if username.contains(searchText.lowercased()) {
          filterOthers.append(credential)
      }
    }
     self.tableView.reloadData()
  }
}


extension CredentialProviderViewController: UITableViewDataSource, UITableViewDelegate {
  
  // section 0 contain credentials for the uri, section 1 for all others
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    if section == 0 {
      return self.filterCredentials.count
    }
    
    return self.filterOthers.count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    
    let credential = indexPath.section == 0 ? self.filterCredentials[indexPath.row] : self.filterOthers[indexPath.row]
    let cell = tableView.dequeueReusableCell(withIdentifier: "cell") as! CredentialTableViewCell
    cell.makeCell(credential: credential)
    cell.editCredential.tag = Int(credential["id"]!)!
    cell.editCredential.addTarget(self, action: #selector(connected(sender:)), for: .touchUpInside)
    return cell
  }
  @objc func connected(sender: UIButton){
    let editPassView = storyboard?.instantiateViewController(withIdentifier: "EditPasswordView") as! EditPasaswordViewController
    editPassView.credential = credentialIdStore.passwords[sender.tag]
    present(editPassView, animated: true)
  }
  
  
  func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
    return section == 0 ? "Passwords for \"\(credentialIdStore.URI)\" (\(credentialIdStore.credentials.count))" : "All passwords (\(credentialIdStore.otherCredentials.count))"
  }
  func numberOfSections(in tableView: UITableView) -> Int {
    
    // #warning Incomplete implementation, return the number of sections
    // credential for the uri and other
    return 2
  }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    
    let target = indexPath.section == 0 ? filterCredentials[indexPath.row] : filterOthers[indexPath.row]
    completeRequest(user: target["username"] ?? "", password: target["password"] ?? "")
  }
 
}
