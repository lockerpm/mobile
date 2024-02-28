//
//  CredentialRow.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 26/02/2024.
//

import SwiftUI
import CachedAsyncImage


struct CredentialRow: View {
  var item: AutofillData
  
  var websiteLogo: String {
    get {
      
        let url = URL(string: item.uri)
        let domain = url?.host ?? ""

      return domain.isEmpty ? "" : "https://locker.io/logo/\(domain)?size=120"
      
    }
  }
  
  var body: some View {
    HStack {
      if websiteLogo.isEmpty {
        Image("password")
            .resizable()
            .scaledToFit()
            .frame(width: 40, height: 40)
            .clipShape(RoundedRectangle(cornerRadius: 12))
      } else {
        CachedAsyncImage(url: URL(string: websiteLogo)) {  phase in
          switch phase {
          case .empty:
            RoundedRectangle(cornerRadius: 12)
              .frame(width: 40, height: 40)
             .background(Color("border"))
          case .success(let image):
              image
                  .resizable()
          case .failure(_):
            Image("password")
                .resizable()
          @unknown default:
            Image("password")
                .resizable()
          }
        }
        .scaledToFit()
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
//      Image(systemName: "ellipsis")
    }
  }
}

