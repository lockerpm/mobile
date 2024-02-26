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
  var credentials: [AutofillData] = []
  
  public func getAutofillDataById(id: String?) -> AutofillData? {
    if id == nil {
      return nil
    }
    if let autofillData = self.credentials.first(where: {$0.id == id}){
      return autofillData
    }
    
    return nil
  }
  
  func setAutofillData(_ passwords: [String: [[String: Any]]]){
    // reset data
    self.credentials = []
  
    if passwords["passwords"] != nil {
      for (index, item) in passwords["passwords"]!.enumerated() {

        let credential = AutofillData(fillID: index,
                                      name: (item["name"] as? String)!,
                                      id: (item["id"] as? String)!,
                                      uri: (item["uri"] as? String)!,
                                      username: (item["username"] as? String)!,
                                      password: (item["password"] as? String)!,
                                      isOwner: (item["isOwner"] as? Bool)!,
                                      otp: (item["otp"] as? String)!)
        self.credentials.append(credential)
      }
    }
  }
}
