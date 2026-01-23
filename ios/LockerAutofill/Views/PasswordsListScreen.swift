//
//  CredentialsListScreen.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import SwiftUI

struct PasswordsListScreen: View {
  var afd: AutofillScreenDelegate // autofill delegate
  var userInfo: UserInfo
  
  @State private var searchText = ""
  
  @State private var isShowCreatePassword = false
  @State private var isShowPasswordGenerator = 0
  @State private var isInitSearch = false
  
  // Navigation to detail
  @State private var showDetail = false
  @State private var selectedItemForDetail: AFPasswordItem = AFPasswordItem(fillID: 1, id: 1, tmp: TempPasswordItem(username: "", password: "", name: "", uri: ""))
  
  var allPasswords: [AFPasswordItem] {
    return afd.user.mode == .fillText ? afd.user.afPasswords.filter {
      !$0.login.password.isEmpty
    } : afd.user.afPasswords
  }
  // if user search for domain or url with no result. show suggest search text for best resutl
  var suggestSearchs: [String] {
    parseDomain(of: afd.user.URI)
  }
  
  var initSearch: String {
    if suggestSearchs.isEmpty {
      return ""
    } else {
      return suggestSearchs[0]
    }
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
        if !searchText.isEmpty && passwords.isEmpty {
          Text(i.translate("list.noDataSearch") +  "'\(searchText)'")
            .foregroundStyle(AppColors.label)
          if searchText == initSearch &&  suggestSearchs.count > 1{
            Text(i.translate("list.suggestSearch") )
              .foregroundStyle(AppColors.label)
            ForEach(suggestSearchs[1..<suggestSearchs.count], id: \.self) { searchText in
              Button {
                self.searchText = searchText
              } label: {
                Text(searchText)
              }
            }
          }
        } else {
          ForEach(passwords, id: \.login.id) { pw in
            Button {
              onClickPassword(data: pw)
            } label: {
              PasswordItemView(
                item: pw,
                onChevronTap: {
                  // Navigate to detail when chevron tapped
                  selectedItemForDetail = pw
                  showDetail = true
                }
              )
            }
          }
          
        }
      }
      .padding(.top, -24)
      .onAppear{
        if !isInitSearch {
          self.isInitSearch = true
          self.searchText = initSearch
        }
      }
      .foregroundStyle(AppColors.title)
      .autocapitalization(.none)
      .navigationTitle(i.translate("list.title"))
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel")) {
            afd.cancel()
          }
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          Button {
            isShowPasswordGenerator = 1
          } label: {
            Image(systemName: "ellipsis.rectangle.fill")
          }
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          NavigationLink(
            destination:  CreatePasswordScreen(
              token: userInfo.token,
              isFree: userInfo.isFree,
              initWebsite: initSearch,
              goBack: {
                isShowCreatePassword = false
              },
              saveAndFill: afd.createPasswordItem
            ),
            isActive: $isShowCreatePassword
          ) {
            Button {
              isShowCreatePassword = true
            } label: {
              Image(systemName: "plus")
            }
          }
        }
      }
      .navigationBarTitleDisplayMode(.inline)
      // Hidden NavigationLink to drive chevron -> detail navigation
      .background(
        NavigationLink(
          destination: CredentialDetailScreen(afd: afd, userInfo: userInfo, item: selectedItemForDetail),
          isActive: $showDetail,
          label: { EmptyView() }
        )
        .hidden()
      )
    }
    .searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .always))
    .navigationBarHidden(true)
    .navigationBarBackButtonHidden()
    .halfSheet(showSheet: $isShowPasswordGenerator) {
      StrongPasswordGenerator(usePassword: {password in
        afd.passwordSelected(password: password)
        isShowPasswordGenerator = 2
      })
    }
    .background(AppColors.background)
  }
  
  
  func onClickPassword(data: AFPasswordItem) {
    afd.passwordSelected(data: data)
  }
}

