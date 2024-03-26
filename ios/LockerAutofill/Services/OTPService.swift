//
//  OTPService.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import Foundation
import SwiftOTP

let otpService = OTPService()

struct OTPService {
   func getOTPAlgorithm(algr: String) -> OTPAlgorithm {
    switch algr {
    case "SHA1":
      return .sha1
    case "SHA256":
      return .sha256
    case "SHA512":
      return .sha512
    default:
      return .sha1
    }
  }
  func getQueryParamValue(uri: String, query: String) -> String {
    let queryItems = URLComponents(string: uri)?.queryItems
    return queryItems?.filter({$0.name == query}).first?.value ?? ""
  }

  func getOTPFromUri(uri: String) -> TOTP {
    if !uri.contains("/") {
      let totp = TOTP(secret: Data(base32Decode(uri)!), digits: 6, timeInterval: 30, algorithm: .sha1)!
      return totp
    }
    
    let secret: String = getQueryParamValue(uri: uri, query: "secret")
    let algorithm: OTPAlgorithm = getOTPAlgorithm(algr: getQueryParamValue(uri: uri, query: "algorithm"))
    let timeInterval: Int = Int(getQueryParamValue(uri: uri, query: "period")) ?? 30
    let digits: Int = Int(getQueryParamValue(uri: uri, query: "digits")) ?? 6
    
    let totp = TOTP(secret: Data(base32Decode(secret)!), digits: digits, timeInterval: timeInterval, algorithm: algorithm)!
  
    return totp
  }

}
