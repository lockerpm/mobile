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
  
  var passkeys: [AFPasskeyItem] {
    if searchText.isEmpty {
      return afd.user.afPasskeys
    } else {
      let search = searchText.lowercased()
      return afd.user.afPasskeys.filter {
        $0.key.rpId.lowercased().contains(search)
        || $0.key.userName.lowercased().contains(search)
      }
    }
  }
  
  var body: some View {
    NavigationView{
      List {
        if !searchText.isEmpty && passkeys.isEmpty {
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
          ForEach(passkeys, id: \.key.credentialId) { pk in
            Button {
              afd.passkeySelected(data: pk)
            } label: {
              PasskeyItemView(item: pk)
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
      }
      .navigationBarTitleDisplayMode(.inline)
    }
    .searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .always))
    .navigationBarHidden(true)
    .navigationBarBackButtonHidden()
    .background(AppColors.background)
  }
}

