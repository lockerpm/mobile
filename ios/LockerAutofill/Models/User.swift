//
//  User.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import Foundation


class User {
  // Data used by autofill service
  var faceIdEnabled: Bool = false
  var loginedLocker: Bool = false
  var isFree: Bool = true
  
  var autofillMobileApp: Bool = false
  var URI: String = ""
  
  var email: String = ""
  var avatar: String = ""
  var hashMassterPass: String = ""
  var language: String = "en"
  var token: String = ""

  var credentials: [AutofillData] = []
  
  func getAutofillDataById(id: String?) -> AutofillData? {
    if id == nil {
      return nil
    }
    if let autofillData = self.credentials.first(where: {$0.id == id}){
      return autofillData
    }
    return nil
  }
  
  func setUri(uri: String, isDomain: Bool) {
    self.URI = uri
    self.autofillMobileApp = isDomain
  }
  
  func addTempPassword(_ item: TempLoginItem) {
    let currentCredentialsLength = credentials.count
    let credential = AutofillData(fillID: currentCredentialsLength,
                                  id: "tempPassword" + String(currentCredentialsLength),
                                  name: item.name,
                                  uri: item.uri ,
                                  username: item.username,
                                  password: item.password,
                                  isOwner: true,
                                  otp: "" )
    self.credentials.append(credential)
  }
  
  func setPasswords(_ passwords: [LoginItem]){
    if !passwords.isEmpty {
      for (index, item) in passwords.enumerated() {
        let credential = AutofillData(fillID: index,
                                      id: item.id,
                                      name: item.name,
                                      uri: item.uri ,
                                      username: item.username,
                                      password: item.password,
                                      isOwner: item.isOwner,
                                      otp: item.otp )
        self.credentials.append(credential)
      }
    }
  }
  
  func setInfo(_ data: UserInfo) {
    self.faceIdEnabled = data.faceIdEnabled
    self.email = data.email
    self.language = data.language
    self.hashMassterPass = data.hashPass
    self.avatar = data.avatar
    self.token = data.token
    self.isFree = data.isFree
  }
}
