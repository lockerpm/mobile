//
//  CredentialIdentityStore.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 30/11/2021.
//

import Foundation
import KeychainAccess

struct PasswordCredential {
  var autofillID: String!
  var name: String!
  var id: String!
  var uri: String!
  var username: String!
  var password: String!
  var isOwner: Bool!
  init(autofillID: String,name: String, id: String, uri: String, username: String,password: String, isOwner:Bool) {
    self.autofillID = autofillID
    self.id = id
    self.uri = uri
    self.username = username
    self.password = password
    self.isOwner = isOwner
    self.name = name
  }
  init(){}
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
  var passwords: [String: [[String: Any]]] = [:]    // convert autofilldata string to array
  private var keychain: Keychain
  private var passwordAuthen: [String: String] = [:]
  private var faceIdEnabled: Bool = false
  
  
  var credentials: [PasswordCredential] = []
  var otherCredentials: [PasswordCredential] = []
  let URI: String
  
  
  init(_ uri: String) {
    self.URI = URL(string: uri)?.host ?? ""
    
    
    // Get data from shared keychain
    self.keychain = Keychain(service: KEYCHAIN_SERVICE, accessGroup: KEYCHAIN_ACCESS_GROUP)
    self.autofillData = try! keychain.get(KEYCHAIN_PROPS) ?? "[]"

    self.jsonToDict(text: self.autofillData)
//    passwords = self.toArray(text: self.autofillData) ?? []
    print(self.passwords)
    
    setAutofillData()
    
  }
  public func isFaceIdEnabled() -> Bool {
    return self.faceIdEnabled
  }
  public func getPasswordAuthen() -> [String: String]{
    return self.passwordAuthen
  }
  public func addNewCredential(credential: PasswordCredential) {
    var newPassword: [String: Any] = [:]
    //newPassword["autofillID"] = self.passwords["passwords"]?.count
    newPassword["id"] = ""
    newPassword["name"] = credential.name
    newPassword["uri"] = credential.uri
    newPassword["username"] = credential.username
    newPassword["password"] = credential.password
    newPassword["isOwner"] = credential.isOwner
    self.passwords["passwords"]?.append(newPassword)
    self.passwords["deleted"] = []
    setKeychain(dictionary: self.passwords)
  }
//  public func editCredential(credential: PasswordCredential) {
//
//  }
  public func removeCredential(credential: PasswordCredential) {
    let passwords = self.passwords["passwords"]!
    print(credential)
    if credential.id == "" {
      // remove session added item
      for (index, item) in passwords.enumerated() {
        if item["autofillID"] as? String == credential.autofillID {
          self.passwords["passwords"]!.remove(at: index)
          break
        }
      }
    } else {
      for (index, item) in passwords.enumerated() {
        if item["id"] as? String == credential.id {
          self.passwords["deleted"]?.append(["id" : item["id"]!])
          self.passwords["passwords"]!.remove(at: index)
          break
        }
      }
    }
    
    setKeychain(dictionary: self.passwords)
    setAutofillData()
  }
//
  private func setAutofillData(){
    // reset data
    self.credentials = []
    self.otherCredentials = []
    if self.passwords["passwords"] != nil {
      for (index, item) in self.passwords["passwords"]!.enumerated() {
        let cipherUri = (item["uri"] as? String)!
        // for autofill only
        self.passwords["passwords"]![index]["autofillID"] = String(index)
        
        let credential = PasswordCredential(autofillID: String(index),name: (item["name"] as? String)!,  id: (item["id"] as? String)!, uri: (item["uri"] as? String)!, username: (item["username"] as? String)!, password: (item["password"] as? String)!, isOwner: (item["isOwner"] as? Bool)!)
      
       // print(credential)
        if self.URI.isEmpty || self.URI.contains(cipherUri.lowercased()) {
          self.credentials.append(credential)
        } else {
          self.otherCredentials.append(credential)
        }
      }
    }
    
  }
  private func setKeychain(dictionary: [String: [[String: Any]]]) {
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
  private func jsonToDict(text: String) {
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
          self.passwordAuthen = authen
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
    
  }

}
