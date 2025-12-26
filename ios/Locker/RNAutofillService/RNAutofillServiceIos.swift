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
    _ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
  ) {
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
        if state.isEnabled {
          resolve(true)
        } else {
          resolve(false)
        }
    }
  }
}

