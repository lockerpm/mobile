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
}

var newPassword = PasswordCredential()

class CredentialIdentityStore {
  private let KEYCHAIN_SERVICE: String = "W7S57TNBH5.com.cystack.lockerapp"
  private let KEYCHAIN_ACCESS_GROUP: String = "group.com.cystack.lockerapp"
  
  private let KEYCHAIN_PROPS: String = "autofill"
  private var autofillData: String
  private var keychain: Keychain
  
  
  var credentials: [[String: String]] = []
  var otherCredentials: [[String: String]] = []
  let URI: String
  
  
  init(_ uri: String) {
    self.URI = URL(string: uri)?.host ?? ""
    
    var passwords: [[String: String]] = []
    // Get data from shared keychain
    self.keychain = Keychain(service: KEYCHAIN_SERVICE, accessGroup: KEYCHAIN_ACCESS_GROUP)
    self.autofillData = try! keychain.get(KEYCHAIN_PROPS) ?? "[]"
    
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
