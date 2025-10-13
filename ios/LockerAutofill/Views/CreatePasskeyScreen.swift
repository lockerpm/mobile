import SwiftUI

struct CreatePasskeyScreen: View {
  var afd: AutofillScreenDelegate // autofill delegate
  var userInfo: UserInfo
  
  
  var passwords: [AFPasswordItem] {
    return afd.user.afPasswords.filter{ item in
      return item.login.isOwner && (item.login.fido2?.isEmpty ?? true)
    }
  }
  
  var duplicatedPasskey: PasskeyItem! {
    if let foundNumber = afd.user.afPasskeys.first(where: { $0.rpId == afd.user.newPasskeyRpID && $0.userName == afd.user.newPasskeyUsername }) {
      print(foundNumber)
      return foundNumber
    }
    return nil
  }
  
  var body: some View {
    NavigationView {
      List {
        if (duplicatedPasskey != nil) {
          Section {
            PasskeyItemView(item: duplicatedPasskey)
          } header: {
            Text("Key đã có")
          } footer: {
            Text("Cảnh báo: vault của bạn đã có một key với cùng tên username: \(afd.user.URI) và cùng rpId: \(afd.user.newPasskeyUsername), không nên tạo thêm key mới.")
              .foregroundStyle(AppColors.warning)
          }
        }
        
        Section {
          Button {
            afd.passkeyRegistration(id: "")
          } label: {
            HStack {
              Image(systemName: "person.badge.key") // Use an SF Symbol
                .resizable()
                .frame(width: 24, height: 24)
              Text("Tạo mới Passkey")
            }
          }
        } header: {
          Text("Tạo mới item password")
            .foregroundStyle(AppColors.label)
        }
        
        Section {
          ForEach(passwords, id: \.login.id) { pw in
            Button {
              afd.passkeyRegistration(id: pw.login.id)
            } label: {
              PasswordItemSimpleView(item: pw)
            }
          }
        } header: {
          Text("Thêm passkey vào password có sẵn")
            .foregroundStyle(AppColors.label)
        }
      }
      .foregroundStyle(AppColors.title)
      .autocapitalization(.none)
      .navigationBarBackButtonHidden()
      .navigationBarTitleDisplayMode(.inline)
      .navigationTitle("Create Passkey")
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel")) {
            afd.cancel()
          }
        }
      }
    }
    .navigationBarHidden(true)
    .navigationBarBackButtonHidden()
    .background(AppColors.background)
  }
}

