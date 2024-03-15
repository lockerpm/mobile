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

        Image(systemName: isShowDetail ? "chevron.down" : "chevron.right")
          .onTapGesture {
              if isShowDetail {
                isShowDetailId = -1
              } else {
                isShowDetailId = item.fillID
              }
          }
          .foregroundColor(.secondary)
          .padding(EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 0))
       }
    }
    
  
  }
}
