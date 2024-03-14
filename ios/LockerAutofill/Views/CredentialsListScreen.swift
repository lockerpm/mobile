//
//  CredentialsListScreen.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import SwiftUI

struct CredentialsListScreen: View {
  var credentials: [AutofillData]
  var cancel: () -> Void
  var onSelect: (_ data: AutofillData) -> Void
  var uri: String
  
  
  @State private var searchText = ""
  @State private var isShowItemDetailId = -1
  
  // if user search for domain or url with no result. show suggest search text for best resutl
  var suggestSearchs: [String] {
    parseDomain(of: uri)
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
      return credentials
    } else {
      let search = searchText.lowercased()
      return credentials.filter {
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
              onSelect(credential)
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
        self.searchText = initSearch
      }
      .searchable(text: $searchText)
      .autocapitalization(.none)
      .navigationTitle(i.translate("list.title"))
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel")) {
            cancel()
          }
        }
      }
      .navigationBarTitleDisplayMode(.inline)
    }
    .navigationBarHidden(true)
    .navigationBarBackButtonHidden()
  }
}

