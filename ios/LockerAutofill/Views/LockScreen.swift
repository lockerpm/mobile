//
//  LockScreen.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import SwiftUI

struct LockScreen: View {
  var user: User
  var quickBar: Bool
  var onSelect: (_ data: AutofillData) -> Void
  var cancel: () -> Void
  var quickBarCredential: AutofillData!
  
  @State private var masterPassword: String = ""
  @State private var isShowCredentialsList = false
  
  var body: some View {
    NavigationView {
      VStack {
        Image("Logo")
          .padding()
        Text(i.translate("lock.title"))
          .fontWeight(.medium)
          .padding(.bottom, 4)
        
        UserAvatar(imageUri: user.avatar, email: user.email ?? "")
        
        MasterPasswordInput(masterPassword: $masterPassword)
        
        NavigationLink(destination:  CredentialsListScreen(credentials: user.credentials, cancel: self.cancel, onSelect: onSelect, uri: user.URI), isActive: $isShowCredentialsList) {
          Button {
            passwordAuthen()
          } label: {
            Text(i.translate("lock.btn"))
              .frame(maxWidth: .infinity)
              .foregroundStyle(.white)
          }
          .padding(.vertical, 10)
          .background(RoundedRectangle(cornerRadius: 12).fill(Color("primary")))
          .opacity(masterPassword.isEmpty ? 0.5 : 1)
        }
        .disabled(masterPassword.isEmpty)
       
        if user.faceIdEnabled{
          Button {
            biometricAuthen()
          } label: {
            Label(i.translate("lock.faceid") , systemImage: "faceid")
          }
          .buttonStyle(.plain)
          .padding(.top, 16)
        }
        
        Spacer()
      }
      .padding()
//      .background(Color("background"))
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel"), action: cancel)
        }
      }
      .navigationBarTitleDisplayMode(.inline)
    }
  }
  
  private func passwordAuthen() {
    let hash = authenService.makeKeyHash(masterPassword: masterPassword, email: user.email)
    if hash == user.hashMassterPass {
      authenSuccess()
    } else {
      cancel()
    }
  }
  
  private func biometricAuthen() {
      authenService.biometricAuthentication(onSuccess: {
        authenSuccess()
      }, onFailed: cancel)
  }
  
  private func authenSuccess() {
    if (self.quickBarCredential == nil) {
      self.isShowCredentialsList = true
    } else {
      onSelect(self.quickBarCredential)
    }

  }
}


