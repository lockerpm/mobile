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
  private var decodeData: KeychainData = KeychainData(passwords: [], email: "", hashPass: "", avatar: "", faceIdEnabled: false, language: "", isDarkTheme: false, isLoggedInPw: false)
  private var keychain = Keychain()
  
  init(_ user: User){
    keychain = Keychain(service: KEYCHAIN_SERVICE, accessGroup: KEYCHAIN_ACCESS_GROUP)
    keychainData = try! keychain.get(KEYCHAIN_PROPS)
    self.user = user
    if (keychainData != nil) {
      self.user.loginedLocker = true;
    }
    
    fetchAutofillData(text: keychainData)
  }
  
  func saveAutofillData(tempItem: TempLoginItem) {
    do {
      if (self.decodeData.tempPasswords != nil) {
        self.decodeData.tempPasswords?.append(tempItem)
      } else {
        self.decodeData.tempPasswords = Array([tempItem])
      }


      let jsonEncoder = JSONEncoder()
      let jsonData = try jsonEncoder.encode(self.decodeData)
      let json = String(data: jsonData, encoding: String.Encoding.utf8)
      print(json)
      try keychain.set( json!, key: KEYCHAIN_PROPS)
    }  catch {
      fatalError("Couldn't encode jsonData to save\(error)")
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
      let decoder = JSONDecoder()
      decodeData = try decoder.decode(KeychainData.self, from: jsonData)
      user.syncLocker(decodeData)
    } catch {
      print("Couldn't parse jsonData as \(KeychainData.self):\n\(error)")
    }
  }
}
