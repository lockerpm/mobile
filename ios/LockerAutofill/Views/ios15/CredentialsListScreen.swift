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
          Text("Oops, looks like there's no data match '\(searchText)'")
        } else {
          ForEach(searchCredentials, id: \.id) { credential in
              Button {
                onSelect(credential)
              } label: {
                CredentialItem(item: credential, isShowDetailId: $isShowItemDetailId)
            }
          }
        }
      } .onAppear{
        self.searchText = uri
      }
      .searchable(text: $searchText)
      .autocapitalization(.none)
      .navigationTitle("Login List")
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button("Cancel") {
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

