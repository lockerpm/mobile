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
  
  var body: some View {
    NavigationView{
      List {
        ForEach(credentials, id: \.id) { credential in
          CredentialItem(item: credential)
        }
      }
      .onAppear{
        self.searchText = uri
      }
      .searchable(text: $searchText)
      .navigationTitle("Login List")
      .navigationBarTitleDisplayMode(.inline)
    }
    
  }
}

