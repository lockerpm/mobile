//
//  AutofillDelegate.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 25/03/2024.
//

import Foundation

protocol AutofillScreenDelegate {
  var user: User! {get}
  func cancel()
  func loginSelected(data: AutofillData)
  func passwordSelected(password: String)
  func createLoginItem(item: TempLoginItem)
}
