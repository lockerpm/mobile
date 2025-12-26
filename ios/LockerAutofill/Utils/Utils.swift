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
  static let group = UserDefaults(suiteName: "group.com.cystack.lockerapp")!
}


private func dataFromMaybeUrl(_ input: String?) -> String? {
  guard let input = input, !input.isEmpty else { return nil }
  // Try to parse as URL, adding https:// if missing a scheme
  if let url = URL(string: input), url.scheme != nil {
    return url.host ?? url.absoluteString
  }
  if let url = URL(string: "https://" + input), let host = url.host {
    return host
  }
  // Fallback: treat input as host
  return input
}

private func stripCommon(_ host: String?) -> String? {
  guard var h = host?.lowercased(), !h.isEmpty else { return host }
  // Remove common subdomains
  if h.hasPrefix("www.") { h.removeFirst(4) }
  if h.hasPrefix("m.") { h.removeFirst(2) }
  if h.hasPrefix("mobile.") { h.removeFirst(7) }

  // Remove leading common TLD labels like "com.", "org.", etc.
  let tlds = ["com", "org", "net", "io", "gov", "edu"]
  for tld in tlds {
    if h.hasPrefix("\(tld).") {
      h = String(h.dropFirst(tld.count + 1))
      break
    }
  }
  // Remove trailing common TLDs like ".com", ".org", etc.
  for tld in tlds {
    if h.hasSuffix(".\(tld)") {
      h = String(h.dropLast(tld.count + 1))
      break
    }
  }
  return h
}

func isUriHostMatch(_ uriA: String?, _ uriB: String?) -> Bool {
  guard let uriA = uriA, !uriA.isEmpty, let uriB = uriB, !uriB.isEmpty else { return false }
  guard let hostA = dataFromMaybeUrl(uriA), let hostB = dataFromMaybeUrl(uriB) else { return false }
  guard let domA = stripCommon(hostA), let domB = stripCommon(hostB) else { return false }
  return domA == domB
}
