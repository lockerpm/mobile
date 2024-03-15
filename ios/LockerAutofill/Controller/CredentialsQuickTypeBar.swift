//
//  CredentialsQuickTypeBar.swift
//  LockerAutofill
//
//  This file controls how credentials are managed in the keyboard quickbar for easier autofill in one step
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import Foundation
import AuthenticationServices

let quickTypeBar = QuickTypeBar()

struct QuickTypeBar {
  func passwordCredentialIndentity(_ identifier: String, _ type: ASCredentialServiceIdentifier.IdentifierType = .domain, _ username: String, _ userID: String) -> ASPasswordCredentialIdentity {
    let credential = ASPasswordCredentialIdentity(
      serviceIdentifier: ASCredentialServiceIdentifier(
        identifier: identifier,
        type: type),
      user: username,
      recordIdentifier: userID
    )
    credential.rank = currentTimeInMilliSeconds()
    return credential
  }
  
  func addCredentialsQuickTypeBar(identifier: String, type: ASCredentialServiceIdentifier.IdentifierType, username: String, userID: String){
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
      if state.isEnabled {
        ASCredentialIdentityStore.shared.saveCredentialIdentities([passwordCredentialIndentity(identifier, type, username, userID)])
      }
    }
  }
  
  func removeCredentialIdentities(_ credentialIdentities: ASPasswordCredentialIdentity){
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
      if state.isEnabled {
        ASCredentialIdentityStore.shared.removeCredentialIdentities([credentialIdentities])
      }
    }
  }
  
  func replaceCredentialIdentities(identifier: String, type: ASCredentialServiceIdentifier.IdentifierType, username: String, userID: String) {
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
      if state.isEnabled {
        ASCredentialIdentityStore.shared.saveCredentialIdentities([passwordCredentialIndentity(identifier, type, username, userID)])
      }
    }
  }
  
  func removeAllCredentialIdentities() {
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
      if state.isEnabled {
        ASCredentialIdentityStore.shared.removeAllCredentialIdentities()
      }
    }
  }
  
  func currentTimeInMilliSeconds()-> Int {
    let currentDate = Date()
    let since1970 = currentDate.timeIntervalSince1970
    return Int(since1970 * 1000)
  }
}

