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
    switch algr.uppercased() {
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
    return queryItems?.first(where: { $0.name == query })?.value ?? ""
  }

  // Normalize a secret string:
  // - Remove invalid characters
  // - Uppercase
  // - Try Base32 decode; if ok, return decoded Data
  // - Else, return UTF-8 Data of the cleaned string
  func normalizeSecret(_ secret: String) -> Data {
    // Remove spaces, dashes, and any non-Base32 characters.
    // Valid Base32 alphabet: A–Z and 2–7
    let upper = secret.uppercased()
    let filtered = upper.compactMap { ch -> Character? in
      switch ch {
      case "A"..."Z", "2", "3", "4", "5", "6", "7":
        return ch
      default:
        return nil
      }
    }
    let cleaned = String(filtered)

    // Try Base32 decode first
    if let decoded = base32Decode(cleaned) {
      return Data(decoded)
    }

    // Fallback: raw bytes of cleaned string
    return Data(cleaned.utf8)
  }

  func getOTPFromUri(uri: String) -> TOTP {
    // If uri is a raw secret (no slash), build with defaults
    if !uri.contains("/") {
      let secretData = normalizeSecret(uri)
      // Defaults: 6 digits, 30s, SHA1
      let totp = TOTP(secret: secretData, digits: 6, timeInterval: 30, algorithm: .sha1)!
      return totp
    }

    // otpauth URI
    let secret = getQueryParamValue(uri: uri, query: "secret")
    let secretData = normalizeSecret(secret)

    let algorithm = getOTPAlgorithm(algr: getQueryParamValue(uri: uri, query: "algorithm"))
    let timeInterval = Int(getQueryParamValue(uri: uri, query: "period")) ?? 30
    let digits = Int(getQueryParamValue(uri: uri, query: "digits")) ?? 6

    let totp = TOTP(secret: secretData, digits: digits, timeInterval: timeInterval, algorithm: algorithm)!
    return totp
  }
}
