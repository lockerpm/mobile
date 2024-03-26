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
  var email: String!
  var hashMassterPass: String!
  var avatar: String!
  var URI: String!
  var autofillMobileApp: Bool = false
  var credentials: [AutofillData] = []
  var language: String = "vi"
  var isDarkTheme: Bool = false
  var isLoggedInPw: Bool = false
  
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
  
  func setAutofillData(_ data: KeychainData){
    self.credentials = []
    
    let passwords = data.passwords

    
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
    print(passwords.count)
    if let tempPasswords = data.tempPasswords {
      print(tempPasswords)
      for (index, item) in tempPasswords.enumerated() {
        let credential = AutofillData(fillID: passwords.count + index,
                                      id: "tempPassword" + String(index),
                                      name: item.name,
                                      uri: item.uri ,
                                      username: item.username,
                                      password: item.password,
                                      isOwner: true,
                                      otp: "" )
        self.credentials.append(credential)
      }
    }
    print(self.credentials.count)
  }
  
  func syncLocker(_ data: KeychainData) {
    self.setAutofillData(data)
    self.faceIdEnabled = data.faceIdEnabled
    self.email = data.email
    self.language = data.language
    self.hashMassterPass = data.hashPass
    self.avatar = data.avatar
    self.isLoggedInPw = data.isLoggedInPw
  }
}
