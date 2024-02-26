//
//  CredentialRow.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 26/02/2024.
//

import SwiftUI

struct CredentialItem: View {
  var item: AutofillData
  
  var websiteLogo: String {
    get {
      if (item.uri.isEmpty || item.uri == "https://") {
        return ""
      }
      var url = URL(string: item.uri)
      var domain = url?.host ?? ""
      
      if (domain.isEmpty) {
        return ""
      }
      return "https://locker.io/logo/\(domain)?size=120"
    }
  }
  
  var body: some View {
    HStack {
      if websiteLogo.isEmpty {
        Image("passIcon")
          .resizable()
          .frame(width: 40, height: 40)
          .clipShape(RoundedRectangle(cornerRadius: 12))
      } else {
        AsyncImage(url: URL(string: websiteLogo)) { image in
          image
            .resizable()
        } placeholder: {
          ProgressView()
        }
        .frame(width: 40, height: 40)
        .clipShape(RoundedRectangle(cornerRadius: 12))
      }
      
      
      VStack(alignment: .leading){
        Text(item.name)
        Text(item.username)
          .font(.subheadline)
          .foregroundStyle(.secondary)
      }
      Spacer()
      Image(systemName: "ellipsis")
    }
  }
}

