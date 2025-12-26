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
            .lineLimit(1)
            .truncationMode(.tail)
          if !item.login.username.isEmpty {
            Text(item.login.username)
              .font(.subheadline)
              .foregroundStyle(AppColors.label)
              .lineLimit(1)
              .truncationMode(.tail)
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

struct PasswordItemSimpleView: View {
  var item: AFPasswordItem
  var body: some View {
    VStack(alignment: .leading){
      HStack {
        PasswordImage(itemUri: item.login.uri)
        
        VStack(alignment: .leading){
          Text(item.login.name)
            .lineLimit(1)
            .truncationMode(.tail)
          if !item.login.username.isEmpty {
            Text(item.login.username)
              .font(.subheadline)
              .foregroundStyle(AppColors.label)
              .lineLimit(1)
              .truncationMode(.tail)
          }
        }
        Spacer()
        if ((item.login.fido2) != nil && !item.login.fido2.isEmpty) {
          Image(systemName: "key.fill")
            .foregroundColor(AppColors.label)
            .padding(EdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 0))
        }
      }
    }
  }
}

struct PasskeyItemView: View {
  var item: PasskeyItem
  var body: some View {
    VStack(alignment: .leading){
      HStack {
        PasskeyImage(rpId: item.rpId)
        
        VStack(alignment: .leading){
          Text(item.userName)
        }
        Spacer()
      }
    }
  }
}
