import Foundation
import KeychainAccess
import StoreKit
import Sentry

class AutofillDataModel {
  private var tempPasswords: [TempPasswordItem] = []
  
  func getUserInfo() -> UserInfo! {
    do {
      let keychain = Keychain(service: infoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      var keychainData = try! keychain.get(infoKey.username) ?? ""
      if (!keychainData.isEmpty) {
        let jsonData = Data(keychainData.utf8)
        let decoder = JSONDecoder()
        let decodeData = try decoder.decode(UserInfo.self, from: jsonData)
        return decodeData
      }
      return nil
    } catch {
      SentrySDK.capture(message: "Couldn't decode jsonData when getUserInfo: \(error)")
    }
    return nil
  }
  
  func getPasswords() -> [PasswordItem] {
    do {
      let keychain = Keychain(service: passwordKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      var keychainData = try! keychain.get(passwordKey.username) ?? ""
      if (!keychainData.isEmpty) {
        let jsonData = Data(keychainData.utf8)
        let decoder = JSONDecoder()
        let decodeData = try decoder.decode([PasswordItem].self, from: jsonData)
        return decodeData
      }
      return []
    } catch {
      SentrySDK.capture(message: "Couldn't decode jsonData when getPasswords: \(error)")
    }
    return []
  }
  
  func getTempPasswords() -> [TempPasswordItem] {
    do {
      let keychain = Keychain(service: tempPasswordKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      var keychainData = try! keychain.get(tempPasswordKey.username) ?? ""
      if (!keychainData.isEmpty) {
        let jsonData = Data(keychainData.utf8)
        let decoder = JSONDecoder()
        let decodeData = try decoder.decode([TempPasswordItem].self, from: jsonData)
        self.tempPasswords.append(contentsOf: decodeData)
        return decodeData
      }
      return []
    } catch {
      SentrySDK.capture(message: "Couldn't decode jsonData when getTempPasswords: \(error)")
    }
    return []
  }
  
  func saveTempPassword(_ tempItem: TempPasswordItem) {
    do {
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
