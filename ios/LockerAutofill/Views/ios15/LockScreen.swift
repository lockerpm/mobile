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
  var autofillQuickTypeBar: () -> Void
  var onSelect: (_ data: AutofillData) -> Void
  var cancel: () -> Void
  
  @State private var masterPassword: String = ""
  @State private var isShowCredentialsList = false
  
  var body: some View {
    NavigationView {
      VStack {
        Image("Logo")
          .padding()
        Text("Verify Master Password")
          .fontWeight(.bold)
          .padding(.bottom, 4)
        
        UserAvatar(imageUri: user.avatar, email: user.email ?? "")
        
        MasterPasswordInput(masterPassword: $masterPassword)
        
        NavigationLink(destination:  CredentialsListScreen(credentials: user.credentials, cancel: self.cancel, onSelect: onSelect, uri: user.URI), isActive: $isShowCredentialsList) {
          Button {
            passwordAuthen()
          } label: {
            Text("Unlock")
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
            Label("Unlock with Face ID/Touch ID" , systemImage: "faceid")
              .foregroundStyle(Color("label"))
          }
          .padding(.top, 16)
        }
        
        Spacer()
      }
      .padding()
      .background(Color("background"))
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button("Cancel", action: cancel)
        }
      }
      .navigationBarTitleDisplayMode(.inline)
    }
  }
  
  private func passwordAuthen() {
    let hash = authenService.makeKeyHash(masterPassword: masterPassword, email: user.email)
    if hash == user.hashMassterPass {
      self.isShowCredentialsList = true
    } else {
      cancel()
    }
  }
  
  private func biometricAuthen() {
      authenService.biometricAuthentication(onSuccess: {
        self.isShowCredentialsList = true
      }, onFailed: cancel)
  }
}


