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
  
  private var keychain: Keychain
  private var keychainData: String

  // Data used by autofill service
  var passwords: [String: [[String: Any]]] = [:]     // convert autofilldata passwords string to array
  private var masterPassword: [String: String] = [:]  // convert autofilldata authentication
  private var faceIdEnabled: Bool = false             // convert autofilldata enable faceid
  private var loginedLocker: Bool = false
  
  private var credentials: [AutofillData] = []          // credential for this URI
  private var otherCredentials: [AutofillData] = []
  private var URI: String = ""
  
  init() {
    self.keychain = Keychain(service: KEYCHAIN_SERVICE, accessGroup: KEYCHAIN_ACCESS_GROUP)
    self.keychainData = try! keychain.get(KEYCHAIN_PROPS) ?? "[]"
  }
  
  public func fetchAutofillDataForUriKeychain(uri: String){
    self.URI = URL(string: uri)?.host ?? ""
    
    if (keychainData != "[]") {
      // Keychain dont have data -> login app first
      self.loginedLocker = true;
      // convert autofillData to usable autofill data
      fetchAutofillData(text: self.keychainData)
      print(self.passwords)
    }
  }
  
  // call before fetch keychain data
  public func isLoginLocker() -> Bool {
    return self.loginedLocker
  }
  
  public func isFaceIdEnabled() -> Bool {
    return self.faceIdEnabled
  }
  
  public func getUserEmail() -> String {
    return self.masterPassword["email"]!
  }
  
  public func getUserHashMasterPass() -> String {
    return self.masterPassword["hashPass"]!
  }
  
  public func getCredentials() -> [AutofillData] {
    return self.credentials
  }
  
  public func getOtherCredentials() -> [AutofillData] {
    return self.otherCredentials
  }
  
  public func getUri() -> String {
    return self.URI
  }

  public func addNewAutofillData(credential: AutofillData) {
//    var newPassword: [String: Any] = [:]
//    //newPassword["autofillID"] = self.passwords["passwords"]?.count
//    newPassword["id"] = ""
//    newPassword["name"] = credential.name
//    newPassword["uri"] = credential.uri
//    newPassword["username"] = credential.username
//    newPassword["password"] = credential.password
//    newPassword["isOwner"] = credential.isOwner
//    self.passwords["passwords"]?.append(newPassword)
//    self.passwords["deleted"] = []
//    setKeychain(dictionary: self.passwords)
  }
//  public func editCredential(credential: PasswordCredential) {
//
//  }

  public func removeAutofillData(credential: AutofillData) {
//    let passwords = self.passwords["passwords"]!
//    print(credential)
//    if credential.id == "" {
//      // remove session added item
//      for (index, item) in passwords.enumerated() {
//        if item["autofillID"] as? String == credential.autofillID {
//          self.passwords["passwords"]!.remove(at: index)
//          break
//        }
//      }
//    } else {
//      for (index, item) in passwords.enumerated() {
//        if item["id"] as? String == credential.id {
//          self.passwords["deleted"]?.append(["id" : item["id"]!])
//          self.passwords["passwords"]!.remove(at: index)
//          break
//        }
//      }
//    }
//
//    setKeychain(dictionary: self.passwords)
//    setAutofillData()
  }

  
  
  private func setAutofillData(){
    // reset data
    self.credentials = [] // for this uri
    self.otherCredentials = []
    
    if self.passwords["passwords"] != nil {
      for (index, item) in self.passwords["passwords"]!.enumerated() {
        let cipherUri = (item["uri"] as? String)!
        // for autofill only
        self.passwords["passwords"]![index]["autofillID"] = String(index)

        let credential = AutofillData(autofillID: String(index),
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

  private func uploadKeychainData(dictionary: [String: [[String: Any]]]) {
    var data = dictionary
    for index in 0...data["passwords"]!.count-1 {
      data["passwords"]![index].removeValue(forKey: "autofillID")
    }
    let json = dictToJson(dictionary: data)
    print(json)
    do {
        try keychain.set(json, key: KEYCHAIN_PROPS)
    }
    catch let error {
        print(error)
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
    let jsonData = Data(text.utf8)
    do {
      if let autofillData = try JSONSerialization.jsonObject(with: jsonData, options: .mutableContainers) as? [String: Any] {
        if let passwordList = autofillData["passwords"] as? [[String: Any]] {
          self.passwords["passwords"] = passwordList
        }
        if let deleteList = autofillData["deleted"] as? [[String: Any]] {
          self.passwords["deleted"] = deleteList
        }
        if let authen = autofillData["authen"] as? [String: String] {
          self.masterPassword = authen
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
    setAutofillData()
  }
}
