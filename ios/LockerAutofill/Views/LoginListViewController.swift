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
//  var others: [AutofillData]!
  
  @IBOutlet weak var searchBar: UISearchBar!
  @IBOutlet weak var tableView: UITableView!

  var filterCredentials:  [AutofillData]!
//  var filterOthers: [AutofillData]!
//  var hideOtherPasswordsSession = true
  
  override func viewDidLoad() {
    super.viewDidLoad()
//    isModalInPresentation = true //disable the pull-down gesture
    
    self.searchBar.delegate = self
    self.tableView.delegate = self
    self.tableView.dataSource = self
    
    filterCredentials = credentials
//    filterOthers = others
  }
  
  @IBAction func cancel(_ sender: AnyObject?) {
    delegate.cancel()
  }
  
  func completeRequest(data: AutofillData){
    delegate.loginSelected(data: data)
  }
}


extension LoginListViewController: UISearchBarDelegate {
  //mark search bar config, handle search function.
  func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
    filterCredentials = []
//    filterOthers = []
    if searchText == "" {
      filterCredentials = credentials
//      filterOthers = others
    }
    // get matches credentiral username
    for credential in credentials {
      if (isMatchCredentials(credential: credential, searchPattern: searchText)) {
          filterCredentials.append(credential)
      }
    }
//    // for ohters
//    for credential in others {
//      if (isMatchCredentials(credential: credential, searchPattern: searchText)) {
//         filterOthers.append(credential)
//      }
//    }
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
//    if section == 0 {
      return self.filterCredentials.count
//    }
//    return hideOtherPasswordsSession ? 0 : self.filterOthers.count
  }

  func numberOfSections(in tableView: UITableView) -> Int {
    return 1
  }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
//    let target = indexPath.section == 0 ? filterCredentials[indexPath.row] : filterOthers[indexPath.row]
    let target = filterCredentials[indexPath.row]
    completeRequest(data: target)
  }
  
//  @objc
//  private func toggleHideSection(sender: UIButton) {
//    self.hideOtherPasswordsSession = !self.hideOtherPasswordsSession
//    tableView.reloadData()
//  }
  

//  func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
//    return setupTableViewHeader(tableView, section)
//  }

  
  
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
//    let credential = indexPath.section == 0 ? self.filterCredentials[indexPath.row] : self.filterOthers[indexPath.row]
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
//    for item in others {
//      if item.fillID == sender.tag {
//        selectedCredentials = item
//      }
//    }
    
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

extension LoginListViewController {
//  func setupTableViewHeader(_ tableView: UITableView ,_ section: Int) -> UIView {
//    let header = UIView.init(frame: CGRect.init(x: 0, y: 0, width: tableView.frame.width, height: 50))
//    header.backgroundColor = .black
//    let show = UIButton()
//    let label = UILabel()
//
//    show.translatesAutoresizingMaskIntoConstraints = false
//    label.translatesAutoresizingMaskIntoConstraints = false
//
//    header.backgroundColor = UIColor(named: "block")
//    label.textColor = UIColor(named: "text")
//    label.font = label.font.withSize(17)
//
//    show.tintColor = UIColor(named: "text")
//
//    if hideOtherPasswordsSession {
//      show.setImage(UIImage(named: "down"), for: .normal)
//    } else {
//      show.setImage(UIImage(named: "up"), for: .normal)
//    }
//
//    if section == 0 {
//      label.text = Utils.Translate("Passwords for") +  " \"\(delegate.uri)\" (\(self.filterCredentials.count))"
//      show.isHidden = true
//    } else {
//      label.text  = Utils.Translate("Other passwords") + " (\(self.filterOthers.count))"
//      show.isHidden = false
//      show.addTarget(self, action: #selector(self.toggleHideSection(sender:)),
//                              for: .touchUpInside)
//    }
//
//    header.addSubview(label)
//    header.addSubview(show)
//
//    NSLayoutConstraint.activate([
////      header.leadingAnchor.constraint(equalTo: tableView.leadingAnchor),
////      header.trailingAnchor.constraint(equalTo: tableView.trailingAnchor),
//
//      label.centerYAnchor.constraint(equalTo: header.centerYAnchor),
//      label.leadingAnchor.constraint(equalTo: header.leadingAnchor, constant: 16),
//
//      show.centerYAnchor.constraint(equalTo: header.centerYAnchor),
//      show.trailingAnchor.constraint(equalTo: header.trailingAnchor, constant: -16),
//    ])
//    return header
//  }
}
