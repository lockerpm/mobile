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
  @State private var isShowItemDetailId = -1
  
  @State private var isShowCreatePassword = false
  @State private var isShowPasswordGenerator = 0
  @State private var isInitSearch = false
  
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
      return afd.user.afPasswords
    } else {
      let search = searchText.lowercased()
      return afd.user.afPasswords.filter {
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
              afd.passwordSelected(data: pw)
            } label: {
              CredentialItem(item: pw, isShowDetailId: $isShowItemDetailId)
            }
            
            if isShowItemDetailId == pw.fillID {
              VStack {
                if !pw.login.username.isEmpty {
                  CredentialInfo(label: i.translate("item.username"), text: pw.login.username, isCopydable: true)
                }
                if !pw.login.password.isEmpty {
                  CredentialInfo(label: i.translate("item.password"), text: pw.login.password, isCopydable: true)
                }
                if !pw.login.uri.isEmpty && pw.login.uri != "https://" {
                  CredentialInfo(label: "URL", text: pw.login.uri, isCopydable: false)
                }
                if !pw.login.otp.isEmpty {
                  TOTPView(url: pw.login.otp)
                }
              }
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
            destination:  CreateCipherScreen(
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
}

