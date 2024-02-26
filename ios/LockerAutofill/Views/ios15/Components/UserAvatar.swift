//
//  User.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 26/02/2024.
//

import SwiftUI

struct UserAvatar: View {
  let imageUri: String
  let email: String
  var body: some View {
    HStack {
      Spacer()
      HStack{
        if imageUri.isEmpty {
          AsyncImage(url: URL(string: imageUri)) { image in
            image
              .resizable()
              .scaledToFit()
          } placeholder: {
            ProgressView()
          }
          .frame(width: 28, height: 28)
          .background(Color.gray)
          .clipShape(Circle())
        }
        
        
        Text(email).foregroundStyle(Color("title")).padding(.trailing, 10)
      }
      .padding(2)
      .background(RoundedRectangle(cornerRadius: 16).fill(Color("block")))
      Spacer()
    }
    
  }
}
