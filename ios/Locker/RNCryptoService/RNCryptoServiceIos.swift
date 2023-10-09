//
//  RNCryptoServiceIos.swift
//  CyStackLocker
//
//  Created by Nguyen Thinh on 29/03/2022.
//

import Foundation
import Security


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

  
}

