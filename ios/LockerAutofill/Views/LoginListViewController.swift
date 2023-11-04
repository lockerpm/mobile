//
//  LoginListViewController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 21/01/2022.
//

import Foundation
import UIKit



protocol LoginListControllerDelegate {
  var uri: String {get}
  func cancel()
  func loginSelected(data: AutofillData)
}


class LoginListViewController: UIViewController {
  var delegate: LoginListControllerDelegate!
  var credentials:  [AutofillData]!
  
  @IBOutlet weak var searchBar: UISearchBar!
  @IBOutlet weak var tableView: UITableView!

  var filterCredentials:  [AutofillData]!
  
  override func viewDidLoad() {
    super.viewDidLoad()
//    isModalInPresentation = true //disable the pull-down gesture
    
    self.searchBar.delegate = self
    self.tableView.delegate = self
    self.tableView.dataSource = self
    
    let searchStr = prepareInitSearch(searchStr: delegate.uri)
    
    self.searchBar.text = searchStr
    
    print(prepareInitSearch(searchStr: delegate.uri))
    var initCredentials: [AutofillData] = []

    if searchStr.isEmpty {
      initCredentials = credentials
    } else {
      // get matches credentiral username
      for credential in credentials {
        if (isMatchCredentials(credential: credential, searchPattern: searchStr)) {
          initCredentials.append(credential)
        }
      }
    }

    filterCredentials = initCredentials
  }
  
  
  
  @IBAction func cancel(_ sender: AnyObject?) {
    delegate.cancel()
  }
  
  func prepareInitSearch(searchStr: String ) ->String {
    let meaninglessSearch: [String] = ["com", "net", "app", "package", "io"]
    let patterns = searchStr.components(separatedBy: ".").filter { !meaninglessSearch.contains($0)}
    return patterns.joined(separator: " ")
  }
  
  func completeRequest(data: AutofillData){
    delegate.loginSelected(data: data)
  }
}


extension LoginListViewController: UISearchBarDelegate {
  //mark search bar config, handle search function.
  func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
    let trimmedSearch = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
    filterCredentials = []

    if trimmedSearch.isEmpty {
      filterCredentials = credentials
    } else {
      // get matches credentiral username
      for credential in credentials {
        if (isMatchCredentials(credential: credential, searchPattern: trimmedSearch)) {
            filterCredentials.append(credential)
        }
      }
    }
    print(trimmedSearch, "Ádkjasbdjkhasbdhjbasd")


    self.tableView.reloadData()
  }
  
  private func isMatchCredentials(credential: AutofillData, searchPattern: String) -> Bool {
    let patterns = searchPattern.components(separatedBy: " ")
    
    let username: String = credential.username.lowercased()
    let uri = credential.uri.lowercased()
    let name = credential.name.lowercased()
    
    for pattern in patterns {
      if username.contains(pattern.lowercased()) {
          return true
      }
      if uri.contains(pattern.lowercased()) {
          return true
      }
      if name.contains(pattern.lowercased()) {
          return true
      }
    }
  
    return false
  }
}



extension LoginListViewController: UITableViewDataSource, UITableViewDelegate {
  // section 0 contain credentials for the uri, section 1 for all others
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return self.filterCredentials.count

  }

  func tableView(_ tableView: UITableView, titleForHeaderInSection
                              section: Int) -> String? {
    if (self.credentials?.count == 0){
      return "No data"
    } else if (self.filterCredentials.count == 0) {
      return "No data matches '\(self.searchBar.text!)'"
    } else {
      return nil
    }
  }

  func numberOfSections(in tableView: UITableView) -> Int {

    return 1
  }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    let target = filterCredentials[indexPath.row]
    completeRequest(data: target)
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let credential = self.filterCredentials[indexPath.row]
    let cell = tableView.dequeueReusableCell(withIdentifier: "cell") as! CredentialTableViewCell
    cell.makeCell(credential: credential)
    cell.editCredential.tag = credential.fillID
    cell.editCredential.addTarget(self, action: #selector(self.connected(_:)), for: .touchUpInside)
    return cell
  }
  
  @objc func connected(_ sender: UIButton){
    var selectedCredentials: AutofillData!
    for item in credentials {
      if item.fillID == sender.tag {
        selectedCredentials = item
      }
    }
    
    let actionSheet = UIAlertController(title: Utils.Translate("Name: ") + selectedCredentials.name, message: nil , preferredStyle: .actionSheet)
    actionSheet.addAction(UIAlertAction(title: Utils.Translate("Copy Username"), style: .default, handler: {action in
       UIPasteboard.general.string = selectedCredentials.username
    }))
    actionSheet.addAction(UIAlertAction(title: Utils.Translate("Copy Password"), style: .default, handler: {action in
      UIPasteboard.general.string = selectedCredentials.password
    }))
    
    actionSheet.addAction(UIAlertAction(title: Utils.Translate("Dismiss"), style: .destructive, handler: nil))
  
    present(actionSheet, animated: true, completion: nil)
  }
}

