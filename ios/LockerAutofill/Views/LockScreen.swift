import SwiftUI

struct LockScreen: View {
  var afd: AutofillScreenDelegate // autofill delegate
  var userInfo: UserInfo
  
  @State private var masterPassword: String = ""
  @State private var isShowCredentialsList = false
  
  var body: some View {
    NavigationView {
      VStack {
        Image("Logo")
          .resizable()
          .scaledToFit()
          .frame(width: 70, height: 70)
          .clipShape(RoundedRectangle(cornerRadius: 12))
          .padding()
          
        Text(i.translate("lock.title"))
          .fontWeight(.medium)
          .padding(.bottom, 4)
          .foregroundColor(AppColors.title)
        
        UserAvatar(imageUri: self.userInfo.avatar , email: self.userInfo.email)
        
        MasterPasswordInput(masterPassword: $masterPassword)
        
        NavigationLink(destination:  PasswordsListScreen(afd: self.afd, userInfo: self.userInfo), isActive: $isShowCredentialsList) {
          Button {
            passwordAuthen()
          } label: {
            Text(i.translate("lock.btn"))
              .frame(maxWidth: .infinity)
              .foregroundStyle(.white)
          }
          .padding(.vertical, 10)
          .background(RoundedRectangle(cornerRadius: 12).fill(AppColors.primary))
          .opacity(masterPassword.isEmpty ? 0.5 : 1)
        }
        .disabled(masterPassword.isEmpty)
        
        if self.userInfo.faceIdEnabled{
          Button {
            biometricAuthen()
          } label: {
            Label(i.translate("lock.faceid") , systemImage: "faceid")
              .foregroundStyle(AppColors.label)
          }
          .buttonStyle(.plain)
          .padding(.top, 16)
        }
        
        Spacer()
      }
      .padding()
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel"), action: afd.cancel)
        }
      }
      .navigationBarTitleDisplayMode(.inline)
    }
    .background(AppColors.background)
  }
  
  private func passwordAuthen() {
    let hash = authenService.makeKeyHash(masterPassword: masterPassword, email: self.userInfo.email)
    if hash == self.userInfo.hashPass {
      authenSuccess()
    } else {
      afd.cancel()
    }
  }
  
  private func biometricAuthen() {
    authenService.biometricAuthentication(onSuccess: {
      authenSuccess()
    }, onFailed: afd.cancel)
  }
  
  private func authenSuccess() {
    if (afd.quickBarCredential == nil) {
      self.isShowCredentialsList = true
    } else {
      afd.loginSelected(data: afd.quickBarCredential)
    }
    
  }
}


