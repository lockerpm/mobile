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
  
  @available(iOSApplicationExtension 17.0, *)
  func passkeyCredentialIndentity(_ item: PasskeyItem) -> ASPasskeyCredentialIdentity {
    let credential = ASPasskeyCredentialIdentity(
      relyingPartyIdentifier: item.rpId,
      userName: item.userName,
      credentialID: Data(base64URLEncoded: item.credentialId)!,
      userHandle: Data(base64URLEncoded: item.userHandle)!,
      recordIdentifier: item.userHandle
    )
    credential.rank = currentTimeInMilliSeconds()
    return credential
  }
  
  
  func removeCredentialIdentities(_ credentialIdentities: ASPasswordCredentialIdentity){
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
      if state.isEnabled {
        ASCredentialIdentityStore.shared.removeCredentialIdentities([credentialIdentities])
      }
    }
  }
  
  @available(iOSApplicationExtension 17.0, *)
  func removePasskeyCredentialIdentities(_ passkeyIdentities: ASPasskeyCredentialIdentity){
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
      if state.isEnabled {
        ASCredentialIdentityStore.shared.removeCredentialIdentities([passkeyIdentities])
      }
    }
  }
  
  @available(iOSApplicationExtension 17.0, *)
  func replacePasskeyCredentialIdentities(_ item: PasskeyItem) {
    let store = ASCredentialIdentityStore.shared
    store.getState { state in
      if state.isEnabled {
        ASCredentialIdentityStore.shared.saveCredentialIdentities([passkeyCredentialIndentity(item)])
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

