//
//  PasskeysListScreen.swift
//  Locker
//
//  Created by Nguyen Thinh on 3/10/25.
//
import SwiftUI

struct PasskeysListScreen: View {
  var afd: AutofillScreenDelegate // autofill delegate
  var userInfo: UserInfo
  
  @State private var searchText = ""
  @State private var isShowCreatePassword = false
  
  // if user search for domain or url with no result. show suggest search text for best resutl
  var requestRpId: String {
    afd.user.rpID
  }
  
  var search: String {
    searchText.lowercased()
  }
  
  var allPasskeys: [PasskeyItem] {
    if requestRpId.isEmpty {
      return afd.user.afPasskeys
    } else {
      return afd.user.afPasskeys.filter {
        $0.rpId == requestRpId
      }
    }
  }
  
  var allowedCredentials: [PasskeyItem] {
    allPasskeys.filter { item in
      afd.user.allowedCredentialIDs.contains(item.credentialId)
    }
  }
  
  var passkeys: [PasskeyItem] {
    if (allowedCredentials.isEmpty) {
      return search.isEmpty ? allPasskeys : allPasskeys.filter {
        $0.userName.lowercased().contains(search) || $0.rpId.contains(search)
      }
    }
    return allowedCredentials
  }
  
  var passwords: [AFPasswordItem] {
    if search.isEmpty {
      return afd.user.afPasswords
    } else {
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
        if passkeys.isEmpty && passwords.isEmpty {
          VStack(alignment: .center) {
            Image(systemName: "key.slash") // Use an SF Symbol
              .resizable()
              .frame(width: 46, height: 46)
              .foregroundStyle(AppColors.label)
            Text(i.translate("pk_list.e_text") +  "(\(!search.isEmpty ? search :requestRpId))")
              .frame(maxWidth: .infinity, alignment: .center)
              .multilineTextAlignment(.center)
          }
          .padding(.vertical, 16)
          .frame(maxWidth: .infinity, alignment: .center)
        }
        if !passkeys.isEmpty {
          Section {
            ForEach(passkeys, id: \.credentialId) { pk in
              Button {
                afd.passkeySelected(data: pk)
              } label: {
                PasskeyItemView(item: pk)
              }
            }
          } header: {
            Text(i.translate("pk_list.h") + "(\(requestRpId))")
          }
        }
        if !passwords.isEmpty {
          Section {
            ForEach(passwords, id: \.login.id) { pw in
              Button {
                afd.passwordSelected(data: pw)
              } label: {
                PasswordItemSimpleView(item: pw)
              }
            }
          }
          header: {
            Text(i.translate("list.title"))
          }
        }
      }
      .onAppear{
        initSearch()
      }
      .foregroundStyle(AppColors.title)
      .autocapitalization(.none)
      .navigationTitle(i.translate("pk_list.t2"))
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel")) {
            afd.cancel()
          }
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          NavigationLink(
            destination:  CreatePasswordScreen(
              token: userInfo.token,
              isFree: userInfo.isFree,
              initWebsite: requestRpId,
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
    .searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .automatic))
    .navigationBarHidden(true)
    .navigationBarBackButtonHidden()
    .background(AppColors.background)
  }
  
  func initSearch() {
    let suggestSearchs: [String] = parseDomain(of: afd.user.URI)
    if suggestSearchs.isEmpty {
      self.searchText = ""
    } else {
      self.searchText = suggestSearchs[0]
    }
  }
}


