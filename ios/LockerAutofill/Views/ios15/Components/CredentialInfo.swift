//
//  CredentialInfo.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 26/02/2024.
//

import SwiftUI


struct CredentialInfo: View {
  var label: String
  var text: String
  var isCopydable: Bool
  @State private var copied = false {
     didSet {
         if copied == true {
             DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                 withAnimation {
                     copied = false
                 }
             }
         }
     }
 }
  
  var body: some View {
      VStack(alignment: .leading) {
          Text(label)
              .font(.subheadline)
              .foregroundStyle(.secondary)
              .padding(.trailing, 4)
              .background()
              .offset(x: 16, y: 20)
              .zIndex(/*@START_MENU_TOKEN@*/1.0/*@END_MENU_TOKEN@*/)
          Button {
              UIPasteboard.general.string = text
              self.copied = true
          } label: {
              HStack {
                  Text(text)
                  Spacer()
                  if copied {
                      Text("Copied")
                          .foregroundStyle(.secondary)
                          .transition(.opacity)
                  } else {
                      Image(systemName: "doc.on.doc.fill")
                          .foregroundStyle(.secondary)
                  }
                  
              }
              .foregroundColor(.primary)
              .padding(.vertical, 12)
              .padding(.horizontal, 16)
              .background(RoundedRectangle(cornerRadius: 8).stroke(Color("border"), lineWidth: 1))
          }
         
      }
      .padding(.top, -12)
  
  }
}
