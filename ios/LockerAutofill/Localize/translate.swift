//
//  translate.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import Foundation

var i = Localized()

struct Localized {
  var locale: String!
  func translate(_ key: String) -> String {
    return key.localized(self.locale ?? "en")
  }
}

extension String {
  func localized(_ locale: String) -> String {
    if ( locale == "vi") {
      return NSLocalizedString(
        self,
        tableName: "vi",
        bundle: .main,
        value: self,
        comment: self)
    }
    return NSLocalizedString(
      self,
      tableName: "en",
      bundle: .main,
      value: self,
      comment: self)
  }
}
