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
  private let KEYCHAIN_SERVICE: String = "W7S57TNBH5.com.cystack.lockerapp"
  private let KEYCHAIN_ACCESS_GROUP: String = "group.com.cystack.lockerapp"
  private let KEYCHAIN_PROPS: String = "autofill"
  private var keychainData: String!
  
  // Data used by autofill service
  private(set) var faceIdEnabled: Bool = false
  private(set) var loginedLocker: Bool = false
  private(set) var email: String!
  private(set) var hashMassterPass: String!
  private(set) var URI: String!
  private(set) var credentials: [AutofillData] = []          // credential for this URI
  private(set) var otherCredentials: [AutofillData] = []

  init(){
    let keychain = Keychain(service: KEYCHAIN_SERVICE, accessGroup: KEYCHAIN_ACCESS_GROUP)
    keychainData = try! keychain.get(KEYCHAIN_PROPS) ?? ""
    if (keychainData != "") {
      self.loginedLocker = true;
    }
  }

  public func fetchAutofillData(identifier: String) {
    self.URI = identifier
    fetchAutofillData(text: keychainData)
  }
  
  public func getAutofillDataById(id: String?) -> AutofillData? {
    if id == nil {
      return nil
    }
    if let autofillData = credentials.first(where: {$0.id == id}){
      return autofillData
    }
    
    if let autofillData = otherCredentials.first(where: {$0.id == id}){
      return autofillData
    }
    return nil
  }
  
  private func setAutofillData(_ passwords: [String: [[String: Any]]]){
    // reset data
    self.credentials = [] // for this uri
    self.otherCredentials = []
    
    if passwords["passwords"] != nil {
      for (index, item) in passwords["passwords"]!.enumerated() {
        let cipherUri = (item["uri"] as? String)!
        // for autofill only

        let credential = AutofillData(fillID: index,
                                      name: (item["name"] as? String)!,
                                      id: (item["id"] as? String)!,
                                      uri: (item["uri"] as? String)!,
                                      username: (item["username"] as? String)!,
                                      password: (item["password"] as? String)!,
                                      isOwner: (item["isOwner"] as? Bool)!)

       // print(credential)
        if self.URI.isEmpty || self.URI.contains(cipherUri.lowercased()) {
          self.credentials.append(credential)
        } else {
          self.otherCredentials.append(credential)
        }
      }
    }
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
          self.email = authen["email"]!
          self.hashMassterPass = authen["hashPass"]!
        }
        if let faceIdEnabled = autofillData["faceIdEnabled"] as? Bool {
          self.faceIdEnabled = faceIdEnabled
        }
      }
      else {
        print("JSONSerialization failed")
      }
    } catch {
      print(error.localizedDescription)
    }
    setAutofillData(passwords)
  }
}
