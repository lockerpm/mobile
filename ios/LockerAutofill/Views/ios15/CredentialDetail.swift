//
//  CredentialDetail.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 29/02/2024.
//

import SwiftUI

struct CredentialDetail: View {
  var credential: AutofillData
  var onSelect: (_ data: AutofillData) -> Void
  
  var body: some View {
    VStack {
      PasswordImage(itemUri: credential.uri)
      Text(credential.name)
        .fontWeight(.bold)
        .padding(.bottom, 16)
      Divider()
      
      CredentialInfo(label: "Username or email", text: credential.username, isCopydable: true)
      CredentialInfo(label: "Password", text: credential.password, isCopydable: true)
      CredentialInfo(label: "Url", text: credential.uri, isCopydable: false)
      
      Spacer()
      
      Button {
        onSelect(credential)
      } label: {
        Text("Unlock")
          .frame(maxWidth: .infinity)
          .foregroundStyle(.white)
      }
      .padding(.vertical, 10)
      .background(RoundedRectangle(cornerRadius: 12).fill(Color("primary")))
    }
  }
}

