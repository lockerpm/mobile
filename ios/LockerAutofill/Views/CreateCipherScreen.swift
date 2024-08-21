//
//  CreateCipherScreen.swift
//  CipherInput
//
//  Created by Nguyen Thinh on 21/03/2024.
//

import SwiftUI

struct CreateCipherScreen: View {
  var token: String
  var isFree: Bool
  var initWebsite: String
  var goBack: () -> Void
  var saveAndFill: (_ item: TempLoginItem) -> Void
  
  @FocusState var focusedField: FocusedField?
  @State private var isShowPasswordGenerator = 0
  @State private var isShowPrivateEmail = false
  @State private var isShowErrorGenerateEmail = false
  @State private var isShowEmailList = 0
  
  @State private var itemName: String = ""
  @State private var userName: String = ""
  @State private var passowrd: String = ""
  @State private var webUrl: String = ""
  
  @StateObject var relayData = PrivateEmailModel()
  
  var disableHideEmail: Bool {
    token.isEmpty || relayData.hasError
  }
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
            
            if !disableHideEmail {
              Button {
                isShowPrivateEmail = true
                isShowEmailList = 0
              } label: {
                HStack() {
                  Spacer()
                  Text(i.translate("relay.title"))
                }
                .foregroundStyle(Color("primary"))
              }
              .confirmationDialog(i.translate("relay.title"), isPresented: $isShowPrivateEmail, titleVisibility: .visible) {
                Button(i.translate("relay.generate_new")) {
                  if (isFree && relayData.relays.count >= FREE_LIMIT) {
                    self.isShowErrorGenerateEmail = true
                    self.isShowPrivateEmail = false
                  } else{
                    Task {
                      let email = await relayData.generateRelayNewAddress(token: token)
                      self.userName  = email
                    }
                  }
                }
                
                if relayData.relays.count > 0 {
                  Button(i.translate("relay.existing_email")) {
                    self.isShowEmailList = 1
                    self.isShowPrivateEmail = false
                  }
                }
              }
            }
            
            TextInput(isPassword: true, titleKey: i.translate("create.password"), textField: FocusedField.password, value: $passowrd)
            
            Button {
              isShowPasswordGenerator = 1
            } label: {
              HStack() {
                Spacer()
                Text(i.translate("pw.generator"))
              }
              .foregroundStyle(Color("primary"))
            }
            
            TextInput(titleKey: i.translate("create.web"), textField: FocusedField.url, value: $webUrl)
          }
        }
        .alert(isPresented: $isShowErrorGenerateEmail) {
          Alert(title: Text(i.translate("relay.freeLimit")), message: Text(i.translate("relay.upgrade")), dismissButton: .default(Text("OK")))
        }
        .onAppear {
          self.webUrl = initWebsite
        }
        .padding()
        .background(Color.background)
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
      .disabled(disableSave)
      .padding(.vertical, 10)
      .background(RoundedRectangle(cornerRadius: 12).fill(Color("primary")))
      .opacity(disableSave  ? 0.5 : 1)
      .padding()
    }
    .task {
      await relayData.fetchRelayListAddresses(token: token)
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
        isShowPasswordGenerator = 2
      })
    }
    .halfSheet(showSheet: $isShowEmailList, content: {
      PrivateEmailList(token: token, useEmail: {email in
        self.userName = email
        isShowEmailList = 2
      })
    }, onDismiss: {
      isShowEmailList = 0
    })
    .background(Color.block)
  }
  
  func onSaveButtonPress() {
    let tempItem = TempLoginItem(username: userName, password: passowrd, name: itemName, uri: webUrl)
    saveAndFill(tempItem)
  }
}
