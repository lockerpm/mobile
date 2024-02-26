//
//  translate.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import Foundation


func translate(_ key: String) -> String {
  return key.locolized()
}

extension String {
  func locolized() -> String {
    let locale = NSLocale.current.languageCode
    if ( locale == "vi") {
      return NSLocalizedString(
        self,
        tableName: "Localizable",
        bundle: .main,
        value: self,
        comment: self)
    }
    return self
  }
}
