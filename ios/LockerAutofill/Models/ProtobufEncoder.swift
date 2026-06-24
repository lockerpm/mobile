//
//  ProtobufEncoder.swift
//  LockerAutofill
//
//  Manual Protocol Buffer encoder for autofill data
//

import Foundation

class ProtobufEncoder {
  
  // MARK: - Varint encoding
  
  private static func writeVarint(_ value: UInt64) -> [UInt8] {
    var bytes: [UInt8] = []
    var num = value
    
    while num >= 0x80 {
      bytes.append(UInt8((num & 0x7F) | 0x80))
      num >>= 7
    }
    bytes.append(UInt8(num & 0x7F))
    
    return bytes
  }
  
  // MARK: - Field writing
  
  private static func writeString(fieldNumber: Int, value: String) -> [UInt8] {
    var bytes: [UInt8] = []
    let tag = UInt64((fieldNumber << 3) | 2) // Wire type 2 (length-delimited)
    bytes.append(contentsOf: writeVarint(tag))
    
    guard let strData = value.data(using: .utf8) else {
      return bytes
    }
    
    bytes.append(contentsOf: writeVarint(UInt64(strData.count)))
    bytes.append(contentsOf: strData)
    
    return bytes
  }
  
  private static func writeBool(fieldNumber: Int, value: Bool) -> [UInt8] {
    var bytes: [UInt8] = []
    let tag = UInt64((fieldNumber << 3) | 0) // Wire type 0 (varint)
    bytes.append(contentsOf: writeVarint(tag))
    bytes.append(value ? 1 : 0)
    
    return bytes
  }
  
  private static func writeMessage(fieldNumber: Int, messageBytes: [UInt8]) -> [UInt8] {
    var bytes: [UInt8] = []
    let tag = UInt64((fieldNumber << 3) | 2) // Wire type 2 (length-delimited)
    bytes.append(contentsOf: writeVarint(tag))
    bytes.append(contentsOf: writeVarint(UInt64(messageBytes.count)))
    bytes.append(contentsOf: messageBytes)
    
    return bytes
  }
  
  // MARK: - Encode TempPasswordItem
  
  static func encodeTempPasswords(_ items: [TempPasswordItem]) -> Data {
    var bytes: [UInt8] = []
    
    for item in items {
      var itemBytes: [UInt8] = []
      itemBytes.append(contentsOf: writeString(fieldNumber: 1, value: item.username))
      itemBytes.append(contentsOf: writeString(fieldNumber: 2, value: item.password))
      itemBytes.append(contentsOf: writeString(fieldNumber: 3, value: item.name))
      itemBytes.append(contentsOf: writeString(fieldNumber: 4, value: item.uri))
      
      bytes.append(contentsOf: writeMessage(fieldNumber: 1, messageBytes: itemBytes))
    }
    
    return Data(bytes)
  }
  
  // MARK: - Encode PasskeyItem (TempPasskey)
  
  static func encodeTempPasskeys(_ items: [PasskeyItem]) -> Data {
    var bytes: [UInt8] = []
    
    for item in items {
      var itemBytes: [UInt8] = []
      itemBytes.append(contentsOf: writeString(fieldNumber: 1, value: item.id ?? ""))
      itemBytes.append(contentsOf: writeString(fieldNumber: 2, value: item.credentialId))
      itemBytes.append(contentsOf: writeString(fieldNumber: 3, value: item.keyValue))
      itemBytes.append(contentsOf: writeString(fieldNumber: 4, value: item.rpId))
      itemBytes.append(contentsOf: writeString(fieldNumber: 5, value: item.userHandle))
      itemBytes.append(contentsOf: writeString(fieldNumber: 6, value: item.userName))
      itemBytes.append(contentsOf: writeString(fieldNumber: 7, value: item.creationDate))
      
      bytes.append(contentsOf: writeMessage(fieldNumber: 1, messageBytes: itemBytes))
    }
    
    return Data(bytes)
  }
  
  // MARK: - Encode PasswordItem
  
  static func encodePasswords(_ items: [PasswordItem]) -> Data {
    var bytes: [UInt8] = []
    
    for item in items {
      var itemBytes: [UInt8] = []
      itemBytes.append(contentsOf: writeString(fieldNumber: 1, value: item.id))
      itemBytes.append(contentsOf: writeString(fieldNumber: 2, value: item.name))
      itemBytes.append(contentsOf: writeString(fieldNumber: 3, value: item.uri))
      itemBytes.append(contentsOf: writeString(fieldNumber: 4, value: item.username))
      itemBytes.append(contentsOf: writeString(fieldNumber: 5, value: item.password))
      itemBytes.append(contentsOf: writeBool(fieldNumber: 6, value: item.isOwner))
      
      if !item.otp.isEmpty {
        itemBytes.append(contentsOf: writeString(fieldNumber: 7, value: item.otp))
      }

      if item.hidePassword {
        itemBytes.append(contentsOf: writeBool(fieldNumber: 9, value: item.hidePassword))
      }

      if let fido2Items = item.fido2, !fido2Items.isEmpty {
        for fido in fido2Items {
          var fidoBytes: [UInt8] = []
          fidoBytes.append(contentsOf: writeString(fieldNumber: 1, value: fido.credentialId))
          fidoBytes.append(contentsOf: writeString(fieldNumber: 2, value: fido.keyValue))
          fidoBytes.append(contentsOf: writeString(fieldNumber: 3, value: fido.rpId))
          fidoBytes.append(contentsOf: writeString(fieldNumber: 4, value: fido.userHandle))
          fidoBytes.append(contentsOf: writeString(fieldNumber: 5, value: fido.userName))
          fidoBytes.append(contentsOf: writeString(fieldNumber: 6, value: fido.creationDate))
          
          itemBytes.append(contentsOf: writeMessage(fieldNumber: 8, messageBytes: fidoBytes))
        }
      }
      
      bytes.append(contentsOf: writeMessage(fieldNumber: 1, messageBytes: itemBytes))
    }
    
    return Data(bytes)
  }
  
  // MARK: - Encode OTPItem
  
  static func encodeOTPs(_ items: [OTPItem]) -> Data {
    var bytes: [UInt8] = []
    
    for item in items {
      var itemBytes: [UInt8] = []
      itemBytes.append(contentsOf: writeString(fieldNumber: 1, value: item.id))
      itemBytes.append(contentsOf: writeString(fieldNumber: 2, value: item.name))
      itemBytes.append(contentsOf: writeString(fieldNumber: 3, value: item.otp))
      
      bytes.append(contentsOf: writeMessage(fieldNumber: 1, messageBytes: itemBytes))
    }
    
    return Data(bytes)
  }
  
  // MARK: - Encode UserInfo
  
  static func encodeUserInfo(_ userInfo: UserInfo) -> Data {
    var bytes: [UInt8] = []
    
    bytes.append(contentsOf: writeString(fieldNumber: 1, value: userInfo.email))
    bytes.append(contentsOf: writeString(fieldNumber: 2, value: userInfo.avatar))
    bytes.append(contentsOf: writeString(fieldNumber: 3, value: userInfo.hashPass))
    bytes.append(contentsOf: writeString(fieldNumber: 4, value: userInfo.token))
    bytes.append(contentsOf: writeString(fieldNumber: 5, value: userInfo.language))
    bytes.append(contentsOf: writeBool(fieldNumber: 6, value: userInfo.faceIdEnabled))
    bytes.append(contentsOf: writeBool(fieldNumber: 7, value: userInfo.isFree))
    
    return Data(bytes)
  }
}
