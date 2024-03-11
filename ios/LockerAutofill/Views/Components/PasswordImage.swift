//
//  PasswordImage.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 29/02/2024.
//

import SwiftUI
import CachedAsyncImage

struct PasswordImage: View {
  var itemUri: String
  
  var websiteLogo: String {
    get {
      let url = URL(string: itemUri)
      let domain = url?.host ?? ""
      return domain.isEmpty ? "" : "https://locker.io/logo/\(domain)?size=120"
    }
  }
  var body: some View {
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
            .background(.gray)
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
  }
}

