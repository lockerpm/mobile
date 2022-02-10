//
//  AutofillHelpers.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 10/02/2022.
//

import Foundation
import AuthenticationServices

 
class AutofillHelpers {
  static public func AddCredentialsQuickTypeBar(identifier: String, type: Int = 0, user: String, recordIdentifier: String){
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
        if state.isEnabled {
          let credential = ASPasswordCredentialIdentity(
            serviceIdentifier: ASCredentialServiceIdentifier(
              identifier: identifier,
              type: (type == 0) ? .domain : .URL),
              user: user,
              recordIdentifier: recordIdentifier
          )
          credential.rank = Utils.CurrentTimeInMilliSeconds()

          ASCredentialIdentityStore.shared.saveCredentialIdentities([credential]) { bool, error in
              if let error = error {
                  print(error)
              } else {
                  print("Saved Credential!")
              }
          }
        }
    }
  }

  static public func RemoveCredentialIdentities(_ credentialIdentities: ASPasswordCredentialIdentity){
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
        if state.isEnabled {
          ASCredentialIdentityStore.shared.removeCredentialIdentities([credentialIdentities]) { bool, error in
              if let error = error {
                  print(error)
              } else {
                  print("Remove Credential!")
              }
          }
        }
    }
  }

  static public func ReplaceCredentialIdentities(identifier: String, type: Int = 0, user: String, recordIdentifier: String) {
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
        if state.isEnabled {
          let credential = ASPasswordCredentialIdentity(
            serviceIdentifier: ASCredentialServiceIdentifier(
              identifier: identifier,
              type: (type == 0) ? .domain : .URL),
              user: user,
              recordIdentifier: recordIdentifier
          )
          credential.rank = Utils.CurrentTimeInMilliSeconds()

          ASCredentialIdentityStore.shared.saveCredentialIdentities([credential]) { bool, error in
              if let error = error {
                  print(error)
              } else {
                  print("Replace Credential!")
              }
          }
        }
    }
  }

  static public func RemoveAllCredentialIdentities() {
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
        if state.isEnabled {
          ASCredentialIdentityStore.shared.removeAllCredentialIdentities({ bool, error in
              if let error = error {
                  print(error)
              } else {
                  print("Remove Credential!")
              }
          })
        }
    }
  }
}


