//
//  RNAutofillServiceIos.swift
//  CyStackLocker
//
//  Created by Nguyen Thinh on 28/04/2022.
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
    if #available(iOS 12.0, *) {
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
}

