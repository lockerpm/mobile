//
//  AutofillDataKeychainProtobuf.swift
//  LockerAutofill
//
//  Protobuf-based keychain data access for more efficient storage
//

import Foundation
import KeychainAccess


class AutofillDataModelProtobuf {
  // Current temporary credentials
  private var currTempPasswords: [TempPasswordItem] = []
  private var currTempPasskeys: [PasskeyItem] = []
  
  // Protobuf store keys with .proto suffix
  private let infoProtoKey = IosStoreKey(service: KEYCHAIN_SERVICE + ".info.proto", username: "locker_info")
  private let passwordProtoKey = IosStoreKey(service: KEYCHAIN_SERVICE + ".password.proto", username: "locker_password")
  private let otpProtoKey = IosStoreKey(service: KEYCHAIN_SERVICE + ".otp.proto", username: "locker_otp")
  private let tempPasswordProtoKey = IosStoreKey(service: KEYCHAIN_SERVICE + ".temp_password.proto", username: "locker_temp_password")
  private let tempPasskeyProtoKey = IosStoreKey(service: KEYCHAIN_SERVICE + ".temp_passkey.proto", username: "locker_temp_passkey")

  
  // MARK: - User Info
  
  func getUserInfo() -> UserInfo? {
    do {
      let keychain = Keychain(service: infoProtoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let keychainData = try keychain.get(infoProtoKey.username) ?? ""
      
      if !keychainData.isEmpty {
        return ProtobufDecoder.decodeUserInfo(from: keychainData)
      }
      return nil
    } catch {
      print("Couldn't get protobuf getUserInfo: \(error)")
    }
    return nil
  }
  
  // MARK: - OTP
  
  func getOTPs() -> [OTPItem] {
    do {
      let keychain = Keychain(service: otpProtoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let keychainData = try keychain.get(otpProtoKey.username) ?? ""
      
      if !keychainData.isEmpty {
        return ProtobufDecoder.decodeOTPs(from: keychainData)
      }
      return []
    } catch {
      print("Couldn't get protobuf OTPs: \(error)")
    }
    return []
  }
  
  // MARK: - Passwords
  
  func getPasswords() -> [PasswordItem] {
    do {
      let keychain = Keychain(service: passwordProtoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let keychainData = try keychain.get(passwordProtoKey.username) ?? ""
      
      if !keychainData.isEmpty {
        return ProtobufDecoder.decodePasswords(from: keychainData)
      }
      return []
    } catch {
      print("Couldn't get protobuf passwords: \(error)")
    }
    return []
  }
  
  // MARK: - Temporary Passwords
  
  func getTempPasswords() -> [TempPasswordItem] {
    do {
      let keychain = Keychain(service: tempPasswordProtoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let keychainData = try keychain.get(tempPasswordProtoKey.username) ?? ""
      
      if !keychainData.isEmpty {
        let decoded = ProtobufDecoder.decodeTempPasswords(from: keychainData)
        self.currTempPasswords.append(contentsOf: decoded)
        return decoded
      }
      return []
    } catch {
      print("Couldn't get protobuf temp passwords: \(error)")
    }
    return []
  }
  
  // MARK: - Temporary Passkeys
  
  func getTempPasskeys() -> [PasskeyItem] {
    do {
      let keychain = Keychain(service: tempPasskeyProtoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let keychainData = try keychain.get(tempPasskeyProtoKey.username) ?? ""
      
      if !keychainData.isEmpty {
        let decoded = ProtobufDecoder.decodeTempPasskeys(from: keychainData)
        self.currTempPasskeys.append(contentsOf: decoded)
        return decoded
      }
      return []
    } catch {
      print("Couldn't get protobuf temp passkeys: \(error)")
    }
    return []
  }
  
  // MARK: - Save Methods
  
  func saveTempPassword(_ tempItem: TempPasswordItem) {
    do {
      self.currTempPasswords.append(tempItem)
      
      let data = ProtobufEncoder.encodeTempPasswords(self.currTempPasswords)
      let base64String = data.base64EncodedString()
      
      let keychain = Keychain(service: tempPasswordProtoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      try keychain.set(base64String, key: tempPasswordProtoKey.username)
    } catch {
      print("Couldn't encode protobuf to saveTempPassword: \(error)")
    }
  }
  
  func saveTempPasskey(_ tempItem: PasskeyItem) {
    do {
      var storedPKs = self.currTempPasskeys
      storedPKs.append(tempItem)
      
      let data = ProtobufEncoder.encodeTempPasskeys(storedPKs)
      let base64String = data.base64EncodedString()
      
      let keychain = Keychain(service: tempPasskeyProtoKey.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      try keychain.set(base64String, key: tempPasskeyProtoKey.username)
    } catch {
      print("Couldn't encode protobuf to saveTempPasskey: \(error)")
    }
  }
  
  // MARK: - Helper Methods
  
  /// Check if protobuf data exists for a given key
  func hasProtobufData(for key: IosStoreKey) -> Bool {
    do {
      let keychain = Keychain(service: key.service, accessGroup: KEYCHAIN_ACCESS_GROUP)
      let data = try keychain.get(key.username) ?? ""
      return !data.isEmpty
    } catch {
      return false
    }
  }
  
  /// Check if any protobuf data exists
  func hasAnyProtobufData() -> Bool {
    return hasProtobufData(for: infoProtoKey) ||
           hasProtobufData(for: passwordProtoKey) ||
           hasProtobufData(for: otpProtoKey) ||
           hasProtobufData(for: tempPasswordProtoKey) ||
           hasProtobufData(for: tempPasskeyProtoKey)
  }
}
