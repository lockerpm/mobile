//
//  CredentialsListScreen.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import SwiftUI

struct CredentialsListScreen: View {
  var afd: AutofillScreenDelegate // autofill delegate
  
  @State private var searchText = ""
  @State private var isShowItemDetailId = -1
  
  @State private var isShowCreatePassword = false
  @State private var isShowPasswordGenerator = false
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
  
  var searchCredentials: [AutofillData] {
    if searchText.isEmpty {
      return afd.user.credentials
    } else {
      let search = searchText.lowercased()
      return afd.user.credentials.filter {
        $0.name.lowercased().contains(search)
        || $0.uri.lowercased().contains(search)
        || $0.username.lowercased().contains(search)
      }
    }
  }
  
  var body: some View {
    NavigationView{
      List {
        if !searchText.isEmpty && searchCredentials.isEmpty {
          Text(i.translate("list.noDataSearch") +  "'\(searchText)'")
            .foregroundStyle(.secondary)
          if searchText == initSearch &&  suggestSearchs.count > 1{
            Text(i.translate("list.suggestSearch") )
              .foregroundStyle(.secondary)
            ForEach(suggestSearchs[1..<suggestSearchs.count], id: \.self) { searchText in
              Button {
                self.searchText = searchText
              } label: {
                Text(searchText)
              }
            }
          }
        } else {
          ForEach(searchCredentials, id: \.id) { credential in
            Button {
              afd.loginSelected(data: credential)
            } label: {
              CredentialItem(item: credential, isShowDetailId: $isShowItemDetailId)
            }
            
            if isShowItemDetailId ==  credential.fillID {
              CredentialInfo(label: i.translate("item.username"), text: credential.username, isCopydable: true)
              CredentialInfo(label: i.translate("item.password"), text: credential.password, isCopydable: true)
              CredentialInfo(label: "URL", text: credential.uri, isCopydable: false)
              if !credential.otp.isEmpty {
                TOTPView(url: credential.otp)
              }
            }
          }
        }
      } .onAppear{
        if !isInitSearch {
          self.isInitSearch = true
          self.searchText = initSearch
        }
      }
      .searchable(text: $searchText)
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
            isShowPasswordGenerator = true
          } label: {
            Image(systemName: "ellipsis.rectangle.fill")
          }
        }
        ToolbarItem(placement: .navigationBarTrailing) {
          NavigationLink(
            destination:  CreateCipherScreen(
              initWebsite: initSearch,
              goBack: {
                isShowCreatePassword = false
              },
              saveAndFill: afd.createLoginItem
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
    .navigationBarHidden(true)
    .navigationBarBackButtonHidden()
    .halfSheet(showSheet: $isShowPasswordGenerator) {
      StrongPasswordGenerator(usePassword: {password in
        afd.passwordSelected(password: password)
      })
    }
  }
}

