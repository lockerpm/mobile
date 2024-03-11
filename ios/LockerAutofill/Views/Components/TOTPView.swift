//
//  TOTPView.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 01/03/2024.
//

import SwiftUI
import SwiftOTP

struct TOTPView: View {
  var url: String
  var totp: TOTP {
    otpService.getOTPFromUri(uri: url)
  }
  
  @State private var otp: String = ""
  @State private var updateIn: String = "0"
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
      Button {
          UIPasteboard.general.string = otp
          self.copied = true
      } label: {
        HStack{
          VStack(alignment: .leading){
            Text((otp))
            Text(i.translate("totp.update") + "\(updateIn)")
              .foregroundStyle(.secondary)
              .font(.system(size: 14))
          }
          Spacer()
          if copied {
            Text(i.translate("c.copied"))
                  .foregroundStyle(.secondary)
                  .transition(.opacity)
                  .padding(EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 0))
          } else {
              Image(systemName: "doc.on.doc.fill")
                  .foregroundStyle(.secondary)
                  .padding(EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 0))
            
          }
        }
        .foregroundColor(.primary)
        .padding(EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 16))
        .background(RoundedRectangle(cornerRadius: 8).stroke(Color("border"), lineWidth: 1))
      }
      
      Text(i.translate("totp.desc"))
        .foregroundStyle(.secondary)
        .font(.system(size: 14))
    }
    .onAppear {
      generateNewOTP()
      startTimer()
    }
  }
  
  func startTimer() {
    Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { timer in
      let updateIn = 30 -  Int(Date().timeIntervalSince1970) % 30
      self.updateIn = String(updateIn)
      if updateIn == 0 {
        generateNewOTP()
      }
    }
  }
  
  func generateNewOTP()  {
    let updateIn = 30 -  Int(Date().timeIntervalSince1970) % 30
    self.updateIn = String(updateIn)
    otp = totp.generate(time: Date()) ?? ""
  }
}

