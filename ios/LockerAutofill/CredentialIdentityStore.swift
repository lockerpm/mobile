//
//  CredentialIdentityStore.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 30/11/2021.
//

import Foundation
import KeychainAccess

class CredentialIdentityStore {
  let KEYCHAIN_SERVICE: String = "W7S57TNBH5.com.cystack.lockerapp"
  let KEYCHAIN_ACCESS_GROUP: String = "group.com.cystack.lockerapp"
  
  let URI: String
  var passwords: [[String: String]] = []
  
  init(uri: String) {
    self.URI = uri
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
