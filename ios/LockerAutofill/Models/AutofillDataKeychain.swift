//
//  AutofillDataKeychain.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//

import Foundation
import KeychainAccess
import StoreKit
import Sentry

class AutofillDataModel {
  private var keychainData: String!
  private var user: User
  private var tempPasswords: [TempLoginItem] = []
  
  init(_ user: User){
    self.user = user
  }
  
  func getUserInfo() {
    do {
      let keychain = Keychain(service: infoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      keychainData = try! keychain.get(infoKey.username)
      if (keychainData != nil && !keychainData.isEmpty) {
        self.user.loginedLocker = true;
        let jsonData = Data(keychainData.utf8)
        let decoder = JSONDecoder()
        let decodeData = try decoder.decode(UserInfo.self, from: jsonData)
        user.setInfo(decodeData)
      }
    } catch {
      SentrySDK.capture(message: "Couldn't decode jsonData when getUserInfo: \(error)")
    }
  }
  
  func getPasswords() {
    do {
      let keychain = Keychain(service: passwordKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      keychainData = try! keychain.get(passwordKey.username)
      if (keychainData != nil && !keychainData.isEmpty) {
        let jsonData = Data(keychainData.utf8)
        let decoder = JSONDecoder()
        let decodeData = try decoder.decode([LoginItem].self, from: jsonData)
        user.setPasswords(decodeData)
      }
      try getTempPasswords()
    } catch {
      SentrySDK.capture(message: "Couldn't decode jsonData when getPasswords: \(error)")
    }
  }
  
  func getTempPasswords() throws {
    let keychain = Keychain(service: tempPasswordKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
    keychainData = try! keychain.get(tempPasswordKey.username)
    if (keychainData != nil && !keychainData.isEmpty) {
      let jsonData = Data(keychainData.utf8)
      let decoder = JSONDecoder()
      let decodeData = try decoder.decode([TempLoginItem].self, from: jsonData)
      user.addTempPassword(decodeData)
      self.tempPasswords.append(contentsOf: decodeData)
    }
  }
  
  func saveAutofillData(tempItem: TempLoginItem) {
    do {
      user.addTempPassword([tempItem])
      self.tempPasswords.append(tempItem)
      
      let jsonEncoder = JSONEncoder()
      let jsonData = try jsonEncoder.encode(self.tempPasswords)
      let json = String(data: jsonData, encoding: String.Encoding.utf8)
      
      let keychain = Keychain(service: tempPasswordKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      try keychain.set( json!, key: tempPasswordKey.username)
    }  catch {
      SentrySDK.capture(message: "Couldn't encode jsonData to saveAutofillData: \(error)")
    }
  }
}
