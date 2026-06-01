//
//  RNCryptoServiceIos.swift
//  Locker
//
//  Created by Nguyen Thinh on 17/6/25.
//


import Foundation
import Security
import Argon2Swift

@objc(RNCryptoServiceIos)
class RNCryptoServiceIos: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func decryptOAEPSHA1(
    _ encryptedB64 : String,
    priKeyB64 priKeyB64: String,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock)
  {
    let rsaUtils = RSAUtils();
    let privateKey = try? rsaUtils.addRSAPrivateKey(priKeyB64, tagName: "")!
    //      let privateKey = rsaUtilsWrapper.base64KeyToSecKey(priKeyB64)!
    let error:UnsafeMutablePointer<Unmanaged<CFError>?>? = nil
    
    if let decryptedMessage:Data = SecKeyCreateDecryptedData(privateKey!, .rsaEncryptionOAEPSHA1, rsaUtils.base64Decode(encryptedB64) as CFData,error) as Data?{
      resolve(decryptedMessage.base64EncodedString())
    }
  }
  
  @objc
  func argon2(_ password: String, salt: String, config: NSDictionary? = nil, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    let configDict = config as! Dictionary<String,Any>
    
    let iterations = configDict["iterations", default: 2 ] as! Int
    let memory = configDict["memory", default: 32 * 1024 ] as! Int
    let parallelism = configDict["parallelism", default: 1 ] as! Int
    let hashLength = configDict["hashLength", default: 32 ] as! Int
    let mode = getArgon2Mode(mode: configDict["mode", default: "argon2id"] as! String)
    
    let saltEncoding = configDict["saltEncoding"] as? String ?? "utf8"
    let saltData: Data?
    if saltEncoding.lowercased() == "hex" {
      saltData = Data(hexString: salt)
    } else {
      saltData = salt.data(using: .utf8)
    }
    guard let validSaltData = saltData else {
      let error = NSError(domain: "com.poowf.argon2", code: 400, userInfo: ["Error reason": "Invalid salt format"])
      reject("E_ARGON2", "Invalid salt format", error)
      return
    }
    let saltObject = Salt(bytes: validSaltData)
    
    do {
      // Generate hash using Argon2Swift
      let result = try Argon2Swift.hashPasswordString(
        password: password,
        salt: saltObject,
        iterations: iterations,
        memory: memory,
        parallelism: parallelism,
        length: hashLength,
        type: mode,
        version: .V13
      )
      
      // Get encoded and raw hash values
      let encodedHash = result.encodedString()
      let rawHash = result.hexString()
      
      let resultDictionary: NSDictionary = [
        "rawHash": rawHash,
        "encodedHash": encodedHash,
      ]
      resolve(resultDictionary)
      
    } catch {
      let nsError = NSError(domain: "com.poowf.argon2", code: 200, userInfo: ["Error reason": "Failed to generate argon2 hash: \(error.localizedDescription)"])
      reject("E_ARGON2", "Failed to generate argon2 hash", nsError)
    }
  }
  
  func getArgon2Mode(mode: String) -> Argon2Type {
    switch mode {
    case "argon2d":
      return .d
    case "argon2i":
      return .i
    case "argon2id":
      return .id
    default:
      return .id
    }
  }
}

// Extension to handle hex string conversion for binary salt support
extension Data {
  init?(hexString: String) {
    let length = hexString.count
    if length & 1 != 0 {
      return nil
    }
    var data = Data()
    var index = hexString.startIndex
    for _ in 0..<length/2 {
      let nextIndex = hexString.index(index, offsetBy: 2)
      if let b = UInt8(hexString[index..<nextIndex], radix: 16) {
        data.append(b)
      } else {
        return nil
      }
      index = nextIndex
    }
    self = data
  }
}
