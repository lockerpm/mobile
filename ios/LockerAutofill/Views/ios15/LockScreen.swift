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
  var navigateCredentialsList: () -> Void
  var cancel: () -> Void
  
  
  @State private var masterPassword: String = ""
  

  
  var body: some View {
    VStack {
      HStack {
        Spacer()
        Button {
          cancel()
        } label: {
          Text("Cancel")
        }
        .padding(.trailing)
      }
      Image("Logo")
        .padding()
      Text("Verify Master Password")
        .font(.title)
        .fontWeight(.bold)
        .padding(.bottom, 4)
      Text("Enter your Master Password to Unlock")
        .padding(.bottom)
      
      
      
      UserAvatar(imageUri: user.avatar ?? "", email: user.email ?? "")
      
      MasterPasswordInput(masterPassword: $masterPassword)
      
      Button {
        
      } label: {
        Text("Unlock")
          .frame(maxWidth: .infinity)
          .foregroundStyle(.white)
      }
      .padding(.vertical, 10)
      .background(RoundedRectangle(cornerRadius: 12).fill(Color("primary")))
      
      Button {
        
      } label: {
        Label("Unlock with Face ID/Touch ID" , systemImage: "faceid")
          .foregroundStyle(Color("label"))
      }
      .padding(.top, 16)
      Spacer()
      
      
    }
    .padding()
    .background(Color("background"))
  }
}


