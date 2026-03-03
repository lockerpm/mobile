//
//  ProtobufDecoder.swift
//  LockerAutofill
//
//  Manual Protocol Buffer decoder for autofill data
//

import Foundation

class ProtobufDecoder {
  
  // MARK: - Varint decoding
  
  private static func readVarint(_ data: Data, offset: inout Int) -> UInt64? {
    var result: UInt64 = 0
    var shift: UInt64 = 0
    
    while offset < data.count {
      let byte = data[offset]
      offset += 1
      
      result |= UInt64(byte & 0x7F) << shift
      
      if (byte & 0x80) == 0 {
        return result
      }
      
      shift += 7
      if shift > 63 {
        return nil // Overflow
      }
    }
    
    return nil
  }
  
  // MARK: - Field reading
  
  private static func readString(_ data: Data, offset: inout Int) -> String? {
    guard let length = readVarint(data, offset: &offset) else {
      return nil
    }
    
    let intLength = Int(length)
    guard offset + intLength <= data.count else {
      return nil
    }
    
    let stringData = data.subdata(in: offset..<(offset + intLength))
    offset += intLength
    
    return String(data: stringData, encoding: .utf8)
  }
  
  private static func readBool(_ data: Data, offset: inout Int) -> Bool? {
    guard let value = readVarint(data, offset: &offset) else {
      return nil
    }
    return value != 0
  }
  
  private static func skipField(wireType: UInt8, data: Data, offset: inout Int) {
    switch wireType {
    case 0: // Varint
      _ = readVarint(data, offset: &offset)
    case 1: // 64-bit
      offset += 8
    case 2: // Length-delimited
      if let length = readVarint(data, offset: &offset) {
        offset += Int(length)
      }
    case 5: // 32-bit
      offset += 4
    default:
      break
    }
  }
  
  // MARK: - Message decoders
  
  static func decodeUserInfo(from base64String: String) -> UserInfo? {
    guard let data = Data(base64Encoded: base64String) else {
      return nil
    }
    
    var offset = 0
    var email = ""
    var avatar = ""
    var hashPass = ""
    var token = ""
    var language = ""
    var faceIdEnabled = false
    var isFree = false
    
    while offset < data.count {
      guard let tag = readVarint(data, offset: &offset) else {
        break
      }
      
      let fieldNumber = tag >> 3
      let wireType = UInt8(tag & 0x7)
      
      switch fieldNumber {
      case 1:
        email = readString(data, offset: &offset) ?? ""
      case 2:
        avatar = readString(data, offset: &offset) ?? ""
      case 3:
        hashPass = readString(data, offset: &offset) ?? ""
      case 4:
        token = readString(data, offset: &offset) ?? ""
      case 5:
        language = readString(data, offset: &offset) ?? ""
      case 6:
        faceIdEnabled = readBool(data, offset: &offset) ?? false
      case 7:
        isFree = readBool(data, offset: &offset) ?? false
      default:
        skipField(wireType: wireType, data: data, offset: &offset)
      }
    }
    
    return UserInfo(email: email, hashPass: hashPass, avatar: avatar,
                    language: language, token: token,
                    faceIdEnabled: faceIdEnabled, isFree: isFree)
  }
  
  static func decodeTempPasswords(from base64String: String) -> [TempPasswordItem] {
    guard let data = Data(base64Encoded: base64String) else {
      return []
    }
    
    var offset = 0
    var items: [TempPasswordItem] = []
    
    while offset < data.count {
      guard let tag = readVarint(data, offset: &offset) else {
        break
      }
      
      let fieldNumber = tag >> 3
      let wireType = UInt8(tag & 0x7)
      
      if fieldNumber == 1 && wireType == 2 {
        // Read length-delimited message
        guard let length = readVarint(data, offset: &offset) else {
          break
        }
        
        let messageEnd = offset + Int(length)
        var username = ""
        var password = ""
        var name = ""
        var uri = ""
        
        while offset < messageEnd {
          guard let subTag = readVarint(data, offset: &offset) else {
            break
          }
          
          let subFieldNumber = subTag >> 3
          let subWireType = UInt8(subTag & 0x7)
          
          switch subFieldNumber {
          case 1:
            username = readString(data, offset: &offset) ?? ""
          case 2:
            password = readString(data, offset: &offset) ?? ""
          case 3:
            name = readString(data, offset: &offset) ?? ""
          case 4:
            uri = readString(data, offset: &offset) ?? ""
          default:
            skipField(wireType: subWireType, data: data, offset: &offset)
          }
        }
        
        items.append(TempPasswordItem(username: username, password: password,
                                      name: name, uri: uri))
      } else {
        skipField(wireType: wireType, data: data, offset: &offset)
      }
    }
    
    return items
  }
  
  static func decodePasswords(from base64String: String) -> [PasswordItem] {
    guard let data = Data(base64Encoded: base64String) else {
      return []
    }
    
    var offset = 0
    var items: [PasswordItem] = []
    
    while offset < data.count {
      guard let tag = readVarint(data, offset: &offset) else {
        break
      }
      
      let fieldNumber = tag >> 3
      let wireType = UInt8(tag & 0x7)
      
      if fieldNumber == 1 && wireType == 2 {
        guard let length = readVarint(data, offset: &offset) else {
          break
        }
        
        let messageEnd = offset + Int(length)
        var id = ""
        var name = ""
        var uri = ""
        var username = ""
        var password = ""
        var isOwner = true
        var otp = ""
        var fido2: [PasskeyItem] = []
        
        while offset < messageEnd {
          guard let subTag = readVarint(data, offset: &offset) else {
            break
          }
          
          let subFieldNumber = subTag >> 3
          let subWireType = UInt8(subTag & 0x7)
          
          switch subFieldNumber {
          case 1:
            id = readString(data, offset: &offset) ?? ""
          case 2:
            name = readString(data, offset: &offset) ?? ""
          case 3:
            uri = readString(data, offset: &offset) ?? ""
          case 4:
            username = readString(data, offset: &offset) ?? ""
          case 5:
            password = readString(data, offset: &offset) ?? ""
          case 6:
            isOwner = readBool(data, offset: &offset) ?? true
          case 7:
            otp = readString(data, offset: &offset) ?? ""
          case 8:
            // Decode Fido2SimpleView
            if let fidoItem = decodeFido2Item(data: data, offset: &offset) {
              fido2.append(fidoItem)
            }
          default:
            skipField(wireType: subWireType, data: data, offset: &offset)
          }
        }
        
        items.append(PasswordItem(id: id, name: name, uri: uri,
                                  username: username, password: password,
                                  isOwner: isOwner, otp: otp, fido2: fido2))
      } else {
        skipField(wireType: wireType, data: data, offset: &offset)
      }
    }
    
    return items
  }
  
  private static func decodeFido2Item(data: Data, offset: inout Int) -> PasskeyItem? {
    guard let length = readVarint(data, offset: &offset) else {
      return nil
    }
    
    let messageEnd = offset + Int(length)
    var credentialId = ""
    var keyValue = ""
    var rpId = ""
    var userHandle = ""
    var userName = ""
    var creationDate = ""
    
    while offset < messageEnd {
      guard let subTag = readVarint(data, offset: &offset) else {
        break
      }
      
      let subFieldNumber = subTag >> 3
      let subWireType = UInt8(subTag & 0x7)
      
      switch subFieldNumber {
      case 1:
        credentialId = readString(data, offset: &offset) ?? ""
      case 2:
        keyValue = readString(data, offset: &offset) ?? ""
      case 3:
        rpId = readString(data, offset: &offset) ?? ""
      case 4:
        userHandle = readString(data, offset: &offset) ?? ""
      case 5:
        userName = readString(data, offset: &offset) ?? ""
      case 6:
        creationDate = readString(data, offset: &offset) ?? ""
      default:
        skipField(wireType: subWireType, data: data, offset: &offset)
      }
    }
    
    return PasskeyItem(credentialId: credentialId, keyValue: keyValue,
                       rpId: rpId, userHandle: userHandle, userName: userName)
  }
  
  static func decodeTempPasskeys(from base64String: String) -> [PasskeyItem] {
    guard let data = Data(base64Encoded: base64String) else {
      return []
    }
    
    var offset = 0
    var items: [PasskeyItem] = []
    
    while offset < data.count {
      guard let tag = readVarint(data, offset: &offset) else {
        break
      }
      
      let fieldNumber = tag >> 3
      let wireType = UInt8(tag & 0x7)
      
      if fieldNumber == 1 && wireType == 2 {
        guard let length = readVarint(data, offset: &offset) else {
          break
        }
        
        let messageEnd = offset + Int(length)
        var id = ""
        var credentialId = ""
        var keyValue = ""
        var rpId = ""
        var userHandle = ""
        var userName = ""
        var creationDate = ""
        
        while offset < messageEnd {
          guard let subTag = readVarint(data, offset: &offset) else {
            break
          }
          
          let subFieldNumber = subTag >> 3
          let subWireType = UInt8(subTag & 0x7)
          
          switch subFieldNumber {
          case 1:
            id = readString(data, offset: &offset) ?? ""
          case 2:
            credentialId = readString(data, offset: &offset) ?? ""
          case 3:
            keyValue = readString(data, offset: &offset) ?? ""
          case 4:
            rpId = readString(data, offset: &offset) ?? ""
          case 5:
            userHandle = readString(data, offset: &offset) ?? ""
          case 6:
            userName = readString(data, offset: &offset) ?? ""
          case 7:
            creationDate = readString(data, offset: &offset) ?? ""
          default:
            skipField(wireType: subWireType, data: data, offset: &offset)
          }
        }
        
        let item = PasskeyItem(credentialId: credentialId, keyValue: keyValue,
                               rpId: rpId, userHandle: userHandle, userName: userName)
        items.append(PasskeyItem(id: id, data: item))
      } else {
        skipField(wireType: wireType, data: data, offset: &offset)
      }
    }
    
    return items
  }
  
  static func decodeOTPs(from base64String: String) -> [OTPItem] {
    guard let data = Data(base64Encoded: base64String) else {
      return []
    }
    
    var offset = 0
    var items: [OTPItem] = []
    
    while offset < data.count {
      guard let tag = readVarint(data, offset: &offset) else {
        break
      }
      
      let fieldNumber = tag >> 3
      let wireType = UInt8(tag & 0x7)
      
      if fieldNumber == 1 && wireType == 2 {
        guard let length = readVarint(data, offset: &offset) else {
          break
        }
        
        let messageEnd = offset + Int(length)
        var id = ""
        var name = ""
        var otp = ""
        
        while offset < messageEnd {
          guard let subTag = readVarint(data, offset: &offset) else {
            break
          }
          
          let subFieldNumber = subTag >> 3
          let subWireType = UInt8(subTag & 0x7)
          
          switch subFieldNumber {
          case 1:
            id = readString(data, offset: &offset) ?? ""
          case 2:
            name = readString(data, offset: &offset) ?? ""
          case 3:
            otp = readString(data, offset: &offset) ?? ""
          default:
            skipField(wireType: subWireType, data: data, offset: &offset)
          }
        }
        
        items.append(OTPItem(id: id, name: name, otp: otp))
      } else {
        skipField(wireType: wireType, data: data, offset: &offset)
      }
    }
    
    return items
  }
}
