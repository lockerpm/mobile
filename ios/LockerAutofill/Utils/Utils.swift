//
//  Utils.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//

import Foundation
import UIKit

func parseDomain(domain: String) -> [String] {
  let meaninglessSearch = ["com", "net", "app", "package", "www"]
  let words: [String] = domain.components(separatedBy: ".").filter{ word in
      (word.count >= 3 && !meaninglessSearch.contains(word))
    }
  // Remove meaning less word, length < 3
  return []
}

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
