//
//  Utils.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 20/01/2022.
//

import Foundation
import UIKit


func parseDomain(of domain: String) -> [String] {
  let meaninglessSearch = ["com", "net", "app", "package", "www"]
  
  // Remove meaning less word, length < 3
  let words: [String] = domain.components(separatedBy: ".").filter{ word in
    (word.count >= 3 && !meaninglessSearch.contains(word))
  }
  
  if words.isEmpty {
      return []
  }
  
  var result: [[String]] = []
  for start in 0..<words.count {
    for end in start+1...words.count {
      let subarray = Array(words[start..<end])
      result.append(subarray)
    }
  }
  
  // sort to move search Domain to top of array
  let searchDomain = words.joined(separator: ".")
  return result.map {$0.joined(separator: ".")}.sorted{ (first, second) -> Bool in
    if first == searchDomain {
      return true
    } else {
      return first < second
    }
  }
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
  static let group = UserDefaults(suiteName: "group.com.cystack.locker.selfhost")!
}
