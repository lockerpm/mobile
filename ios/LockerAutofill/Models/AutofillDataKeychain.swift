//
//  AutofillDataKeychain.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//

import Foundation
import KeychainAccess
import StoreKit


class AutofillDataModel {
  private let KEYCHAIN_SERVICE: String = getStringInfo(key: "SHARED_KEYCHAIN_SERVICE")
  private let KEYCHAIN_ACCESS_GROUP: String = getStringInfo(key: "SHARED_KEYCHAIN_ACCESS_GROUP")
  private let KEYCHAIN_PROPS: String = "autofill"
  private var keychainData: String!
  private var user: User
  
  init(_ user: User){
    let keychain = Keychain(service: KEYCHAIN_SERVICE, accessGroup: KEYCHAIN_ACCESS_GROUP)
    keychainData = try! keychain.get(KEYCHAIN_PROPS)
    self.user = user
    if (keychainData != nil) {
      self.user.loginedLocker = true;
    }
    
    fetchAutofillData(text: keychainData)
  }
    

  private func dictToJson(dictionary: [String: [[String: Any]]]) -> String{
    if let theJSONData = try? JSONSerialization.data(
        withJSONObject: dictionary,
        options: []) {
        return String(data: theJSONData, encoding: .ascii)!
    }
    return ""
  }

  private func fetchAutofillData(text: String) {
    var passwords: [String: [[String: Any]]] = [:]
    let jsonData = Data(text.utf8)
    do {
      if let autofillData = try JSONSerialization.jsonObject(with: jsonData, options: .mutableContainers) as? [String: Any] {
        if let passwordList = autofillData["passwords"] as? [[String: Any]] {
          passwords["passwords"] = passwordList
        }
        if let deleteList = autofillData["deleted"] as? [[String: Any]] {
          passwords["deleted"] = deleteList
        }
        if let authen = autofillData["authen"] as? [String: String] {
          user.email = authen["email"]!
          user.hashMassterPass = authen["hashPass"]!
          user.avatar = authen["avatar"]
        }
        if let faceIdEnabled = autofillData["faceIdEnabled"] as? Bool {
          user.faceIdEnabled = faceIdEnabled
        }
      }
      else {
        print("JSONSerialization failed")
      }
    } catch {
      print(error.localizedDescription)
    }
    user.setAutofillData(passwords)
  }
}
