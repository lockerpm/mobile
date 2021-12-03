//
//  CredentialIdentityStore.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 30/11/2021.
//

import Foundation
import KeychainAccess

struct PasswordCredential {
  var uri: String!
  var name: String!
  var username: String!
  var password: String!
//
//  var uri: String {
//    get {
//      return _uri
//    }
//    set (newVal) {
//      _uri = newVal
//    }
//  }
//  var username: String {
//    get {
//      return _username
//    }
//    set (newVal) {
//      _username = newVal
//    }
//  }
//  var password: String {
//    get {
//      return _password
//    }
//    set (newVal) {
//      _password = newVal
//    }
//  }
}


// stupid work :< i will find a better way to handle share data in swift 
// support for add new password
var newPassword = PasswordCredential()

// gobal store
var credentialIdStore: CredentialIdentityStore!


class CredentialIdentityStore {
  private let KEYCHAIN_SERVICE: String = "W7S57TNBH5.com.cystack.lockerapp"
  private let KEYCHAIN_ACCESS_GROUP: String = "group.com.cystack.lockerapp"
  
  private let KEYCHAIN_PROPS: String = "autofill"
  private var autofillData: String
  var passwords: [[String: String]] = []    // convert autofilldata string to array
  private var keychain: Keychain
  
  
  var credentials: [[String: String]] = []
  var otherCredentials: [[String: String]] = []
  let URI: String
  
  
  init(_ uri: String) {
    self.URI = URL(string: uri)?.host ?? ""
    
    
    // Get data from shared keychain
    self.keychain = Keychain(service: KEYCHAIN_SERVICE, accessGroup: KEYCHAIN_ACCESS_GROUP)
    self.autofillData = try! keychain.get(KEYCHAIN_PROPS) ?? "[]"
    print(self.autofillData)
    passwords = self.toArray(text: self.autofillData) ?? []
    
    // Buttons
    for (_, item) in passwords.enumerated() {
      let cipherUri = item["uri"] ?? ""
      
      if uri.isEmpty || uri.contains(cipherUri.lowercased()) {
        self.credentials.append(item)
        self.otherCredentials.append(item)
      } else {
        self.otherCredentials.append(item)
      }
    }
    print(self.credentials)
  }
  
  public func addNewCredential(credential: PasswordCredential) {
    
  }
  public func editCredential(credential: PasswordCredential) {
    
  }
  public func removeCredential(credential: PasswordCredential) {
    
  }
  
  
  
  private func toArray(text: String) -> [[String: String]]? {
    if let data = text.data(using: .utf8) {
      do {
        return try JSONSerialization.jsonObject(with: data, options: []) as? [[String:String]]
      } catch {
        print(error.localizedDescription)
      }
    }
    return []
  }

}
