//
//  Utils.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//

import Foundation
import UIKit


func getStringInfo(key: String) -> String {
  let a = Bundle.main.object(forInfoDictionaryKey: key) as? String
  return a ?? ""
}

func lightTheme(_ view: UIViewController) -> Bool {
  if view.traitCollection.userInterfaceStyle == .light {
    return true
  }
  return false
}

func toggleHidePass(text: UITextField, eyeIcon: UIButton, initial: Bool = false) -> Void{
  if (initial) {
    text.isSecureTextEntry = initial
  } else {
    text.isSecureTextEntry = !text.isSecureTextEntry
  }
}

extension UserDefaults {
  static let group = UserDefaults(suiteName: "group.com.cystack.lockerapp")!
}
