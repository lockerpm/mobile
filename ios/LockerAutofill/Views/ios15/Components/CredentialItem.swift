//
//  CredentialItem.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 29/02/2024.
//

import SwiftUI

struct CredentialItem: View {
  var item: AutofillData
  @Binding var isShowDetailId: Int
  
  var isShowDetail: Bool {
    isShowDetailId == item.fillID
  }
  
  var body: some View {
    VStack(alignment: .leading){
      HStack {
         PasswordImage(itemUri: item.uri)

         VStack(alignment: .leading){
           Text(item.name)
           Text(item.username)
             .font(.subheadline)
             .foregroundStyle(.secondary)
         }
         Spacer()
        
        
        Image(systemName: "ellipsis")
          .padding(EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 0))
         .onTapGesture {
           if isShowDetail {
             isShowDetailId = -1
           } else {
             isShowDetailId = item.fillID
           }
         }
       }
    }
    
    if isShowDetail {
      CredentialInfo(label: "Username or email", text: item.username, isCopydable: true)
      CredentialInfo(label: "Password", text: item.password, isCopydable: true)
      CredentialInfo(label: "Url", text: item.uri, isCopydable: false)
    }
  }
}
