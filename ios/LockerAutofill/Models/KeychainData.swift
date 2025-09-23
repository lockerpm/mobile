//
//  LockerAutofill
//
//  Created by Nguyen Thinh on 25/03/2024.
//

import Foundation

struct AFPasswordItem {
  var fillID: Int
  var login: PasswordItem
  
  init(fillID: Int, login: PasswordItem) {
    self.fillID = fillID
    self.login = login
  }
  
  init(fillID: Int, id: Int, tmp: TempPasswordItem) {
    self.fillID = fillID
    self.login = PasswordItem(id: "tempPassword" + String(id), name: tmp.name, uri: tmp.uri, username: tmp.username, password: tmp.password)
  }
}

struct PasswordItem: Hashable, Codable {
  var id: String
  var name: String
  var uri: String
  var username: String
  var password: String
  var isOwner: Bool = true
  var otp: String = ""
}

struct TempPasswordItem: Hashable, Codable {
  var username: String
  var password: String
  var name: String
  var uri: String
}

struct UserInfo: Hashable, Codable {
  var email: String
  var hashPass: String
  var avatar: String
  var language: String
  var token: String
  
  var faceIdEnabled: Bool
  var isFree: Bool
}

// Struct equivalent to each key's value in `IosStorekey`
struct IosStoreKey {
  let service: String
  let username: String
}

let KEYCHAIN_SERVICE: String = getStringInfo(key: "SHARED_KEYCHAIN_SERVICE")
let KEYCHAIN_ACCESS_GROUP: String = getStringInfo(key: "SHARED_KEYCHAIN_ACCESS_GROUP")

let infoKey = IosStoreKey(service: KEYCHAIN_SERVICE + ".info", username: "locker_info")
let passwordKey =
IosStoreKey(service: KEYCHAIN_SERVICE + ".password", username: "locker_password")

let tempPasswordKey = IosStoreKey(service: KEYCHAIN_SERVICE + ".temp_password", username: "locker_temp_password")
