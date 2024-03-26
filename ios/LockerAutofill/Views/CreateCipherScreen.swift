//
//  CreateCipherScreen.swift
//  CipherInput
//
//  Created by Nguyen Thinh on 21/03/2024.
//

import SwiftUI

struct CreateCipherScreen: View {
  var initWebsite: String
  var goBack: () -> Void
  var saveAndFill: (_ item: TempLoginItem) -> Void
  
  @FocusState var focusedField: FocusedField?
  @State private var isShowPasswordGenerator = false
  @State private var itemName: String = ""
  @State private var userName: String = ""
  @State private var passowrd: String = ""
  @State private var webUrl: String = ""
  
  var disableSave: Bool {
    webUrl.isEmpty || userName.isEmpty || passowrd.isEmpty || itemName.isEmpty
  }
  
  var body: some View {
    VStack{
      ScrollView {
        VStack {
          HStack {
            Image("password")
              .resizable()
              .scaledToFit()
              .frame(width: 56, height: 56)
              .padding(.top)
              .clipShape(RoundedRectangle(cornerRadius: 12))
            TextInput(titleKey: i.translate("create.name"), textField: FocusedField.name, value: $itemName)
          }
          .padding(.top, -8)
          
          HStack {
            Text(i.translate("create.info"))
            Spacer()
          }
          .padding(.top, 8)
          
          VStack {
            TextInput(titleKey: i.translate("create.username"), textField: FocusedField.username, value: $userName)
            
            TextInput(isPassword: true, titleKey: i.translate("create.password"), textField: FocusedField.password, value: $passowrd)
            
            Button {
              isShowPasswordGenerator = true
            } label: {
              HStack() {
                Label(i.translate("pw.generator"), systemImage: "repeat")
                Spacer()
              }
              .foregroundStyle(Color("primary"))
            }
            
            TextInput(titleKey: i.translate("create.web"), textField: FocusedField.url, value: $webUrl)
          }
        }
        .onAppear {
          self.webUrl = initWebsite
        }
        .padding()
        .background(Color(uiColor: .secondarySystemGroupedBackground))
        .cornerRadius(15)
        .padding()
      }
      Spacer()
      
      Text(i.translate("create.noti"))
        .font(.system(size: 14))
        .foregroundStyle(.secondary)
        .padding(.horizontal)
      
      Button {
        onSaveButtonPress()
      } label: {
        Text(i.translate("create.save"))
          .frame(maxWidth: .infinity)
          .foregroundStyle(.white)
      }
      .padding(.vertical, 10)
      .background(RoundedRectangle(cornerRadius: 12).fill(Color("primary")))
      .opacity(disableSave  ? 0.5 : 1)
      .padding()
    }
    .navigationTitle(i.translate("create.title"))
    .navigationBarBackButtonHidden()
    .toolbar {
      ToolbarItem(placement: .navigationBarLeading) {
        Button(i.translate("create.cancel")) {
          goBack()
        }
      }
    }
    .halfSheet(showSheet: $isShowPasswordGenerator) {
      StrongPasswordGenerator(usePassword: {strongPW in
        self.passowrd = strongPW
      })
    }
  }
  
  func onSaveButtonPress() {
    let tempItem = TempLoginItem(username: userName, password: passowrd, name: itemName, uri: webUrl)
    saveAndFill(tempItem)
  }
}
