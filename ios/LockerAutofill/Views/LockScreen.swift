import SwiftUI

struct LockScreen<TargetView: View>: View {
  var afd: AutofillScreenDelegate // autofill delegate
  var userInfo: UserInfo
  var target: TargetView
  
  @State private var masterPassword: String = "demo@123"
  @State private var isShowTarget = false
  
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
        
        NavigationLink(destination: target, isActive: $isShowTarget) {
          Button {
            unlockWithMasterPassword()
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
            unlockWithBiometric()
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
  
  private func unlockWithMasterPassword() {
    let hash = authenService.makeKeyHash(masterPassword: masterPassword, email: self.userInfo.email)
    if hash == self.userInfo.hashPass {
      authenSuccess()
    } else {
      afd.cancel()
    }
  }
  
  private func unlockWithBiometric() {
    authenService.biometricAuthentication(onSuccess: {
      authenSuccess()
    }, onFailed: afd.cancel)
  }
  
  private func authenSuccess() {
    let mode = afd.user.mode
    if (mode != .quickBarPassword && mode != .quickBarPasskey && mode != .quickBarOTP) {
      self.isShowTarget = true
    } else {
      afd.unlockSuccess()
    }
  }
}


