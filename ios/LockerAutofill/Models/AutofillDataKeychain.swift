import Foundation
import KeychainAccess
import StoreKit
import Sentry

class AutofillDataModel {
  // Trường hợp tạo nhiều temp credentials trong ext
  private var currTempPasswords: [TempPasswordItem] = []
  private var currTempPasskeys: [PasskeyItem] = []
  
  func getUserInfo() -> UserInfo! {
    do {
      let keychain = Keychain(service: infoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let keychainData = try! keychain.get(infoKey.username) ?? ""
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
  
  func getOTPs() -> [OTPItem] {
    do {
      let keychain = Keychain(service: otpKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let keychainData = try! keychain.get(otpKey.username) ?? ""
      if (!keychainData.isEmpty) {
        let jsonData = Data(keychainData.utf8)
        let decoder = JSONDecoder()
        let decodeData = try decoder.decode([OTPItem].self, from: jsonData)
        return decodeData
      }
      return []
    } catch {
      SentrySDK.capture(message: "Couldn't decode jsonData when getOTPs: \(error)")
    }
    return []
  }
  
  func getPasswords() -> [PasswordItem] {
    do {
      let keychain = Keychain(service: passwordKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let keychainData = try! keychain.get(passwordKey.username) ?? ""
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
      let keychainData = try! keychain.get(tempPasswordKey.username) ?? ""
      if (!keychainData.isEmpty) {
        let jsonData = Data(keychainData.utf8)
        let decoder = JSONDecoder()
        let decodeData = try decoder.decode([TempPasswordItem].self, from: jsonData)
        self.currTempPasswords.append(contentsOf: decodeData)
        return decodeData
      }
      return []
    } catch {
      SentrySDK.capture(message: "Couldn't decode jsonData when getTempPasswords: \(error)")
    }
    return []
  }
  
  
  func getTempPasskeys() -> [PasskeyItem] {
    do {
      let keychain = Keychain(service: tempPasskeyKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let keychainData = try! keychain.get(tempPasskeyKey.username) ?? ""
      if (!keychainData.isEmpty) {
        let jsonData = Data(keychainData.utf8)
        let decoder = JSONDecoder()
        let decodeData = try decoder.decode([PasskeyItem].self, from: jsonData)
        self.currTempPasskeys.append(contentsOf: decodeData)
        return decodeData
      }
      return []
    } catch {
      SentrySDK.capture(message: "Couldn't decode jsonData when getTempPasskeys: \(error)")
    }
    return []
  }
  
  func saveTempPassword(_ tempItem: TempPasswordItem) {
    do {
      self.currTempPasswords.append(tempItem)
      
      let jsonEncoder = JSONEncoder()
      let jsonData = try jsonEncoder.encode(self.currTempPasswords)
      let json = String(data: jsonData, encoding: String.Encoding.utf8)
      
      let keychain = Keychain(service: tempPasswordKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      try keychain.set( json!, key: tempPasswordKey.username)
    }  catch {
      SentrySDK.capture(message: "Couldn't encode jsonData to saveTempPassword: \(error)")
    }
  }
  
  func saveTempPasskey(_ tempItem: PasskeyItem) {
    do {
      var storedPKs = self.currTempPasskeys
      storedPKs.append(tempItem)
      let jsonEncoder = JSONEncoder()
      let jsonData = try jsonEncoder.encode(storedPKs)
      let json = String(data: jsonData, encoding: String.Encoding.utf8)
      
      let keychain = Keychain(service: tempPasskeyKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      try keychain.set( json!, key: tempPasskeyKey.username)
    }  catch {
      SentrySDK.capture(message: "Couldn't encode jsonData to saveTempPasskey: \(error)")
    }
  }
}
