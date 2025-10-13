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
  
  
  // if user search for domain or url with no result. show suggest search text for best resutl
  var requestRpId: String {
    afd.user.URI
  }
  
  var allPasskeys: [PasskeyItem] {
    if requestRpId.isEmpty {
      return afd.user.afPasskeys
    } else {
      let search = requestRpId.lowercased()
      return afd.user.afPasskeys.filter {
        $0.rpId == search
      }
    }
  }
  
  var allowedCredentials: [PasskeyItem] {
    allPasskeys.filter { item in
      afd.user.allowedCredentialIDs.contains(item.credentialId)
    }
  }
  
  var passkeys: [PasskeyItem] {
    allowedCredentials.isEmpty ? allPasskeys : allowedCredentials
  }
  
  var body: some View {
    NavigationView{
      List {
        if passkeys.isEmpty {
          VStack(alignment: .center) {
            Image(systemName: "key.slash") // Use an SF Symbol
              .resizable()
              .frame(width: 46, height: 46)
              .foregroundStyle(AppColors.label)
            Text("Không có key nào phù hợp với (\(requestRpId))")
              .frame(maxWidth: .infinity, alignment: .center)
              .multilineTextAlignment(.center)
            Button {
              afd.cancel()
            } label: {
              Text("Lựa chọn khác")
            }
            .buttonStyle(.bordered)
          }
          .padding(.vertical, 16)
          .frame(maxWidth: .infinity, alignment: .center)
          
        } else {
          Section {
            ForEach(passkeys, id: \.credentialId) { pk in
              Button {
                afd.passkeySelected(data: pk)
              } label: {
                PasskeyItemView(item: pk)
              }
            }
          } header: {
            Text("Danh sách khoá cho (\(requestRpId))")
          }
        }
      }
      .foregroundStyle(AppColors.title)
      .autocapitalization(.none)
      .navigationTitle("Danh sách Passkey")
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel")) {
            afd.cancel()
          }
        }
      }
      .navigationBarTitleDisplayMode(.inline)
    }
    .navigationBarHidden(true)
    .navigationBarBackButtonHidden()
    .background(AppColors.background)
  }
}

