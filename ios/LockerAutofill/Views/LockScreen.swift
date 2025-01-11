//
//  LockScreen.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import SwiftUI

struct LockScreen: View {
  var afd: AutofillScreenDelegate // autofill delegate
  var quickBar: Bool
  var quickBarCredential: AutofillData!
  
  @State private var masterPassword: String = ""
  @State private var isShowCredentialsList = false
  
  var body: some View {
    NavigationView {
      VStack {
        Image("Logo")
          .resizable()
          .scaledToFit()
          .frame(width: 70, height: 70)
          .clipShape(RoundedRectangle(cornerRadius: 12))
          .padding()
          
        Text(i.translate("lock.title"))
          .fontWeight(.medium)
          .padding(.bottom, 4)
          .foregroundColor(Color.title)
        
        UserAvatar(imageUri: afd.user.avatar, email: afd.user.email ?? "")
        
        MasterPasswordInput(masterPassword: $masterPassword)
        
        NavigationLink(destination:  CredentialsListScreen(afd: self.afd), isActive: $isShowCredentialsList) {
          Button {
            passwordAuthen()
          } label: {
            Text(i.translate("lock.btn"))
              .frame(maxWidth: .infinity)
              .foregroundStyle(.white)
          }
          .padding(.vertical, 10)
          .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary))
          .opacity(masterPassword.isEmpty ? 0.5 : 1)
        }
        .disabled(masterPassword.isEmpty)
        
        if afd.user.faceIdEnabled{
          Button {
            biometricAuthen()
          } label: {
            Label(i.translate("lock.faceid") , systemImage: "faceid")
              .foregroundStyle(Color.label)
          }
          .buttonStyle(.plain)
          .padding(.top, 16)
        }
        
        Spacer()
      }
      .padding()
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel"), action: afd.cancel)
        }
      }
      .navigationBarTitleDisplayMode(.inline)
    }
    .background(Color.background)
  }
  
  private func passwordAuthen() {
    let hash = authenService.makeKeyHash(masterPassword: masterPassword, email: afd.user.email)
    if hash == afd.user.hashMassterPass {
      authenSuccess()
    } else {
      afd.cancel()
    }
  }
  
  private func biometricAuthen() {
    authenService.biometricAuthentication(onSuccess: {
      authenSuccess()
    }, onFailed: afd.cancel)
  }
  
  private func authenSuccess() {
    if (self.quickBarCredential == nil) {
      self.isShowCredentialsList = true
    } else {
      afd.loginSelected(data: self.quickBarCredential)
    }
    
  }
}


