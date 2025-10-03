//
//  PasswordItemView.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 29/02/2024.
//

import SwiftUI

struct PasswordItemView: View {
  var item: AFPasswordItem
  @Binding var isShowDetailId: Int
  
  var isShowDetail: Bool {
    isShowDetailId == item.fillID
  }
  
  var body: some View {
    VStack(alignment: .leading){
      HStack {
        PasswordImage(itemUri: item.login.uri)
        
        VStack(alignment: .leading){
          Text(item.login.name)
          if !item.login.username.isEmpty {
            Text(item.login.username)
              .font(.subheadline)
              .foregroundStyle(AppColors.label)
          }
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
          .foregroundColor(AppColors.label)
          .padding(EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 0))
      }
    }
    
    
  }
}
