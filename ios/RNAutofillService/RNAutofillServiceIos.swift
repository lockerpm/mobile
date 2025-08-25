//
//  RNAutofillServiceIos.swift
//  Locker
//
//  Created by Nguyen Thinh on 17/6/25.
//


import Foundation
import AuthenticationServices


@objc(RNAutofillServiceIos)
class RNAutofillServiceIos: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool {
      return true
  }
  
  @objc func isAutofillServiceActived(
    _ callback: @escaping RCTResponseSenderBlock
  ) {
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
        if state.isEnabled {
          callback([true])
        } else {
          callback([false])
        }
    }
  }
}

