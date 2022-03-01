//
//  AutofillData.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//

import Foundation

struct AutofillData {
  var fillID: Int!
  var name: String!
  var id: String!
  var uri: String!
  var username: String!
  var password: String!
  var isOwner: Bool!
  
  init(fillID: Int, name: String, id: String, uri: String, username: String,password: String, isOwner:Bool) {
    self.fillID = fillID
    self.id = id
    self.uri = uri
    self.username = username
    self.password = password
    self.isOwner = isOwner
    self.name = name
  }
  init(){}
}

