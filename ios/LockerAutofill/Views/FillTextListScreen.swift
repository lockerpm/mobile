//
//  CredentialsListScreen.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import SwiftUI


struct FillTextListScreen: View {
  var afd: AutofillScreenDelegate // autofill delegate
  var userInfo: UserInfo
  
  @State private var searchText = ""
  @State private var isShowItemDetailId = -1

  @State private var isShowOtpListScreen = false
  @State private var selectedItem: AFPasswordItem? = nil
  
  var allPasswords: [AFPasswordItem] {
    return afd.user.mode == .fillText ? afd.user.afPasswords.filter {
      !$0.login.password.isEmpty
    } : afd.user.afPasswords
  }
  
  var passwords: [AFPasswordItem] {
    if searchText.isEmpty {
      return allPasswords
    } else {
      let search = searchText.lowercased()
      return allPasswords.filter {
        $0.login.name.lowercased().contains(search)
        || $0.login.uri.lowercased().contains(search)
        || $0.login.username.lowercased().contains(search)
      }
    }
  }
  
  var body: some View {
    NavigationView{
      List {
        if (afd.user.mode == .fillText && afd.user.afOTPs.count > 0) {
          Section {
            NavigationLink(
              destination: OTPsListScreen(afd: afd, userInfo: userInfo),
              isActive: $isShowOtpListScreen
            ) {
              Button {
                isShowOtpListScreen = true
              } label: {
                Text(i.translate("list.goToOtp"))
                  .padding(.vertical, 6)
              }
            }
          }
        }
        
        
        if !searchText.isEmpty && passwords.isEmpty {
          Text(i.translate("list.noDataSearch") +  "'\(searchText)'")
            .foregroundStyle(AppColors.label)
        } else {
          ForEach(passwords, id: \.login.id) { pw in
            NavigationLink(
              destination: CredentialDetailScreen(
                afd: afd,
                userInfo: userInfo,
                item: pw
              )
            ) {
              PasswordItemSimpleView(item: pw)
            }
          }
        }
      }
      .padding(.top, -24)
      .foregroundStyle(AppColors.title)
      .autocapitalization(.none)
      .navigationTitle(i.translate("list.title"))
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel")) {
            afd.cancel()
          }
        }
      }
      .navigationBarTitleDisplayMode(.inline)
    }
    .searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .always))
    .navigationBarHidden(true)
    .navigationBarBackButtonHidden()
    .background(AppColors.background)
  }
  
  
  func onClickPassword(data: AFPasswordItem) {
    if (afd.user.mode == .fillText) {
      afd.textSelected(data: data.login.password)
    } else {
      afd.passwordSelected(data: data)
    }
  }
}
