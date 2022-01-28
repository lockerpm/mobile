//
//  AutofillData.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//

import Foundation

struct AutofillData {
  var autofillID: String!
  var name: String!
  var id: String!
  var uri: String!
  var username: String!
  var password: String!
  var isOwner: Bool!
  
  init(autofillID: String,name: String, id: String, uri: String, username: String,password: String, isOwner:Bool) {
    self.autofillID = autofillID
    self.id = id
    self.uri = uri
    self.username = username
    self.password = password
    self.isOwner = isOwner
    self.name = name
  }
  init(){}
}

