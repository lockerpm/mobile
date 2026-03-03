import SwiftUI


struct CreatePasskeyScreen: View {
  var afd: AutofillScreenDelegate // autofill delegate
  var userInfo: UserInfo
  
  var passwords: [AFPasswordItem] {
    return afd.user.afPasswords.filter{ item in
      return item.login.isOwner && isUriHostMatch(item.login.uri, afd.user.newPasskeyRpID)
    }
  }

  var existingPasskeyWithSameIdentities: PasskeyItem! {
    if let foundKey = afd.user.afPasskeys.first(where: { $0.rpId == afd.user.newPasskeyRpID && $0.userName == afd.user.newPasskeyUsername }) {
      return foundKey
    }
    return nil
  }
  
  var isExistingPasskeyWithSameIdentitie: Bool {
    return existingPasskeyWithSameIdentities != nil
  }
  
  @State private var showAlert = false
  @State private var selectedPassword: AFPasswordItem! = nil
  
  var body: some View {
    NavigationView {
      List {
        if (isExistingPasskeyWithSameIdentitie) {
          Section {
            Button {
              afd.cancel()
            } label: {
              PasskeyItemView(item: existingPasskeyWithSameIdentities)
            }
          } header: {
            Text(i.translate("create_pk.existing_key"))
          }
        }
        
        if (!isExistingPasskeyWithSameIdentitie) {
          Section {
            Button {
              afd.passkeyRegistration(id: "")
            } label: {
              HStack {
                Image(systemName: "person.badge.key")
                  .resizable()
                  .frame(width: 24, height: 24)
                Text(i.translate("create_pk.action_btn"))
              }
            }
          } header: {
            Text(i.translate("create_pk.action_header"))
              .foregroundStyle(AppColors.label)
          }
        }
        
        if (passwords.count > 0 && !isExistingPasskeyWithSameIdentitie) {
          Section {
            ForEach(passwords, id: \.login.id) { pw in
              Button {
                selectPassword(pw: pw)
              } label: {
                PasswordItemSimpleView(item: pw)
              }
            }
          } header: {
              Text(i.translate("create_pk.replace_header"))
                .foregroundStyle(AppColors.label)
          }
          .alert(i.translate("create_pk.replace_alert_t"),
                 isPresented: $showAlert) {
            Button("Yes") {
              confirmReplacePasskey()
            }
            Button("No", role: .cancel) {
            }
          } message: {
            Text(i.translate("create_pk.replace_alert_d"))
          }
        }
      }
      .foregroundStyle(AppColors.title)
      .autocapitalization(.none)
      .navigationBarBackButtonHidden()
      .navigationBarTitleDisplayMode(.inline)
      .navigationTitle(i.translate("create_pk.title"))
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
  
  func selectPassword(pw: AFPasswordItem) {
    if (pw.login.isHavePasskey()) {
      showAlert = true
      selectedPassword = pw
    } else {
      afd.passkeyRegistration(id: pw.login.id)
    }
  }
  
  func confirmReplacePasskey() {
    if (self.selectedPassword != nil) {
      afd.passkeyRegistration(id: selectedPassword.login.id)
    }
  }
}
