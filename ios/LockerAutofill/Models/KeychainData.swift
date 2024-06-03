//
//  KeychainData.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 25/03/2024.
//

import Foundation

struct AutofillData {
  var fillID: Int
  var id: String
  var name: String
  var uri: String
  var username: String
  var password: String
  var isOwner: Bool = true
  var otp: String = ""
}

struct LoginItem: Hashable, Codable {
  var id: String
  var name: String
  var uri: String
  var username: String
  var password: String
  var isOwner: Bool = true
  var otp: String = ""
}

struct TempLoginItem: Hashable, Codable {
  var username: String
  var password: String
  var name: String
  var uri: String
}

struct KeychainData: Hashable, Codable {
  var passwords: [LoginItem]
  var tempPasswords: [TempLoginItem]? = []
  var email: String
  var hashPass: String
  var avatar: String
  var faceIdEnabled: Bool
  var language: String
  var isDarkTheme: Bool
  var isLoggedInPw: Bool
}
