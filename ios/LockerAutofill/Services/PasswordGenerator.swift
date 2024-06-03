//
//  PasswordGenerator.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 25/03/2024.
//

import Foundation

struct GeneratePasswordOptions {
  var length: Int = 14
  var ambiguous: Bool = false
  var number: Bool = true
  var minNumber: Int = 1
  var uppercase: Bool = true
  var minUppercase: Int = 0
  var lowercase: Bool = true
  var minLowercase: Int = 0
  var special: Bool = false
  var minSpecial: Int = 1
  
  init(_ length: Int, _ ambiguous: Bool, _ number: Bool, _ uppercase: Bool, _ lowercase: Bool, _ special: Bool) {
    self.length = length
    self.ambiguous = ambiguous
    self.number = number
    self.uppercase = uppercase
    self.lowercase = lowercase
    self.special = special
  }
  
  mutating func sanitizePassword() {
    if self.uppercase {
      if (self.minUppercase <= 0) {
        self.minUppercase = 1
      }
    } else {
      self.minUppercase = 0
    }
    
    if self.lowercase {
      if (self.minLowercase <= 0) {
        self.minLowercase = 1
      }
    } else {
      self.minLowercase = 0
    }
    
    if self.number {
      if (self.minNumber <= 0) {
        self.minNumber = 1
      }
    } else {
      self.minNumber = 0
    }
    
    if self.special {
      if (self.minSpecial <= 0) {
        self.minSpecial = 1
      }
    } else {
      self.minSpecial = 0
    }
    
    let minLength: Int = self.minUppercase + self.minLowercase + self.minNumber + self.minSpecial
    if self.length < minLength {
      self.length = minLength + 1
    }
  }
}


class PasswordGenerator {
  private func shuffleArrayInPlace(array: inout [String]) {
    for i in stride(from: array.count - 1, through: 0, by: -1) {
      let j = randomNumber(min: 0, max: i)
      array.swapAt(i, j)
    }
  }
  
  private func randomNumber(min: Int, max: Int) -> Int {
    return min + Int(arc4random_uniform(UInt32(max - min + 1)))
  }
  
  func generatePassword(length: Int, ambiguous: Bool, number: Bool, uppercase: Bool, lowercase: Bool, special: Bool) -> String {
    var pwOptions = GeneratePasswordOptions(length, ambiguous, number, uppercase, lowercase, special)
    pwOptions.sanitizePassword()
    
    var positions: [String] = []
    if pwOptions.lowercase  {
      positions = Array(repeating: "l", count: pwOptions.minLowercase)
    }
    
    if pwOptions.uppercase  {
      positions = Array(repeating: "u", count: pwOptions.minLowercase)
    }
    
    if pwOptions.number  {
      positions = Array(repeating: "n", count: pwOptions.minLowercase)
    }
    
    if pwOptions.special  {
      positions = Array(repeating: "s", count: pwOptions.minLowercase)
    }
    
    while positions.count < pwOptions.length {
      positions.append("a")
    }
    
    shuffleArrayInPlace(array: &positions)
    
    var allCharSet = ""
    
    var lowercaseCharSet = "abcdefghijkmnopqrstuvwxyz"
    if pwOptions.ambiguous {
      lowercaseCharSet += "l"
    }
    if pwOptions.lowercase {
      allCharSet += lowercaseCharSet
    }
    
    var uppercaseCharSet = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    if pwOptions.ambiguous  {
      uppercaseCharSet += "IO"
    }
    if pwOptions.uppercase  {
      allCharSet += uppercaseCharSet
    }
    
    var numberCharSet = "23456789"
    if pwOptions.ambiguous  {
      numberCharSet += "01"
    }
    if pwOptions.number {
      allCharSet += numberCharSet
    }
    
    let specialCharSet = "!@#$%^&*"
    if pwOptions.special {
      allCharSet += specialCharSet
    }
    
    var password = ""
    for i in 0..<pwOptions.length {
      var positionChars = ""
      switch positions[i] {
      case "l":
        positionChars = lowercaseCharSet
      case "u":
        positionChars = uppercaseCharSet
      case "n":
        positionChars = numberCharSet
      case "s":
        positionChars = specialCharSet
      case "a":
        positionChars = allCharSet
      default:
        break
      }
      
      let randomCharIndex = randomNumber(min: 0, max: positionChars.count - 1)
      let index = positionChars.index(positionChars.startIndex, offsetBy: randomCharIndex)
      password += String(positionChars[index])
    }
    
    return password
  }
}

