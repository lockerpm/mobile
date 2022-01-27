//
//  LoginListViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 21/01/2022.
//

import Foundation
import UIKit



protocol LoginListControllerDelegate {
  func deleteLogin()
  func addLogin(credential: AutofillData)
}


class LoginListViewController: UIViewController {
  var credentialProviderDelegate: CredentialProviderDelegate!
  var credentials:  [AutofillData]!
  var others: [AutofillData]!
  var uri: String!
  
  @IBOutlet weak var searchBar: UISearchBar!
  @IBOutlet weak var tableView: UITableView!

  var filterCredentials:  [AutofillData]!
  var filterOthers: [AutofillData]!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    isModalInPresentation = true //disable the pull-down gesture
    
    self.searchBar.delegate = self
    self.tableView.delegate = self
    self.tableView.dataSource = self
    
    filterCredentials = credentials
    filterOthers = others
  }
  
  @IBAction func cancel(_ sender: AnyObject?) {
    self.credentialProviderDelegate.cancel()
  }
  
  func completeRequest(data: AutofillData){
    self.credentialProviderDelegate.loginSelected(data: data)
  }
  
  @IBAction func add() {
    let newLogin = storyboard?.instantiateViewController(withIdentifier: "newLoginView") as! NewPasswordViewController
    newLogin.uri = uri
    newLogin.loginListControllerDelegate = self
    present(newLogin, animated: true)
  }
  
}


extension LoginListViewController: UISearchBarDelegate {
 
  //mark search bar config, handle search function.
  func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
  
    filterCredentials = []
    filterOthers = []
    if searchText == "" {
      filterCredentials = credentials
      filterOthers = others
    }
    // get matches credentiral username
    for credential in credentials {
      if (isMatchCredentials(credential: credential, searchPattern: searchText)) {
          filterCredentials.append(credential)
      }
    }
    // for ohters
    for credential in others {
      if (isMatchCredentials(credential: credential, searchPattern: searchText)) {
          filterCredentials.append(credential)
      }
    }
    self.tableView.reloadData()
  }
  
  private func isMatchCredentials(credential: AutofillData, searchPattern: String) -> Bool {
    let username: String = credential.username.lowercased()
    let uri = credential.uri.lowercased()
    let name = credential.name.lowercased()
    if username.contains(searchPattern.lowercased()) {
        return true
    }
    if uri.contains(searchPattern.lowercased()) {
        return true
    }
    if name.contains(searchPattern.lowercased()) {
        return true
    }
    return false
  }
}


extension LoginListViewController: UITableViewDataSource, UITableViewDelegate {
  
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
    cell.editCredential.tag = Int(credential.autofillID)!
    cell.editCredential.addTarget(self, action: #selector(connected(sender:)), for: .touchUpInside)
    return cell
  }
  
  @objc func connected(sender: UIButton){
    let editPassView = storyboard?.instantiateViewController(withIdentifier: "editPasswordView") as! EditPasaswordViewController

    for item in credentials {
      if item.autofillID == String(sender.tag) {
        editPassView.credential = item
      }
    }
    for item in others {
      if item.autofillID == String(sender.tag) {
        editPassView.credential = item
      }
    }
    self.navigationController?.pushViewController(editPassView, animated: true)
  }
  
//
//  func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
//    let label = UILabel()
//    let paragraphStyle = NSMutableParagraphStyle()
//    paragraphStyle.firstLineHeadIndent = 20
//
//   // paragraphStyle.
//    let content: String
//
//    if section == 0 {
//      content = Utils.Translate("Passwords for") +  " \"\(uri!)\" (\(self.filterCredentials.count))"
//    } else {
//      content = Utils.Translate("All passwords") + " (\(self.filterOthers.count))"
//    }
//    let attributedString = NSAttributedString(string: content, attributes: [.paragraphStyle : paragraphStyle, .backgroundColor: UIColor.white])
//    label.attributedText = attributedString
//    label.textColor = .lightGray
//    return label
//  }

  func numberOfSections(in tableView: UITableView) -> Int {
    // #warning Incomplete implementation, return the number of sections
    // credential for the uri and other
    return 2
  }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    let target = indexPath.section == 0 ? filterCredentials[indexPath.row] : filterOthers[indexPath.row]
    completeRequest(data: target)
  }
  
  
  func tableView(_ tableView: UITableView, editActionsForRowAt indexPath: IndexPath) -> [UITableViewRowAction]? {
    let edit = UITableViewRowAction(style: .normal, title: Utils.Translate("Detail")) { (action, index) in
      let credential = indexPath.section == 0 ? self.filterCredentials[indexPath.row] : self.filterOthers[indexPath.row]
      let editPassView = self.storyboard?.instantiateViewController(withIdentifier: "editPasswordView") as! EditPasaswordViewController
      editPassView.credential = credential
      self.navigationController?.pushViewController(editPassView, animated: true)
    }
    edit.backgroundColor = UIColor(
      red: CGFloat(61) / 255.0,
      green: CGFloat(150) / 255.0,
      blue: CGFloat(45) / 255.0,
      alpha: CGFloat(1.0)
  )
    return [edit]
  }

}

extension LoginListViewController: LoginListControllerDelegate {
  func deleteLogin() {

  }
  
  func addLogin(credential: AutofillData) {
    completeRequest(data: credential)
  }
}


