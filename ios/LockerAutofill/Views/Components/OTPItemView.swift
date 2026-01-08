//
//  OTPItemView.swift
//  Locker
//
//  Created by Nguyen Thinh on 6/1/26.
//

import SwiftUI
import SwiftOTP

@available(iOS 17.0, *)
struct OtpItemView: View {
  var item: OTPItem
  // Optional global countdown seconds from the list screen.
  // When provided, we’ll regenerate when it hits 0.
  var globalRemaining: Int? = nil
  
  var totp: TOTP {
    otpService.getOTPFromUri(uri: item.otp)
  }
  
  // [issuer, email]
  var account: [String] {
    parseOtpItemName(item.name)
  }
  
  @State private var otp: String = ""
  @State private var timer: Timer?
  @State private var localPeriod: Int = 30
  
  

  var body: some View {
    VStack(alignment: .leading) {
      HStack(alignment: .top){
        VStack(alignment: .leading) {
          Text(account[0])
            .font(.system(size: 18))
            .lineLimit(1)
            .truncationMode(.tail)
          
          if (!account[1].isEmpty) {
            Text(account[1])
              .foregroundColor(AppColors.label)
              .lineLimit(1)
              .truncationMode(.tail)
          }
        }
        Spacer()
        Text(otp)
          .font(.system(size: 20))
          .fontWeight(.bold)
      }
      .foregroundColor(AppColors.title)
    }
    .onAppear {
      // Capture token-specific period
      localPeriod = max(1, Int(totp.timeInterval))
      generateNewOTP()
      // Only run local timer if no global countdown is provided
      if globalRemaining == nil {
        startLocalTimer()
      }
    }
    .onChange(of: globalRemaining ?? -1) { _, newValue in
      // When globalRemaining is provided, regenerate right at boundary
      guard globalRemaining != nil else { return }
      if newValue == 0 {
        generateNewOTP()
      }
    }
    .onDisappear {
      timer?.invalidate()
      timer = nil
    }
  }
  
  // Local timer respects this token’s own period parsed from URL
  private func startLocalTimer() {
    timer?.invalidate()
    let newTimer = Timer(timeInterval: 1, repeats: true) { _ in
      let remaining = self.remainingSeconds(for: self.localPeriod)
      if remaining == 0 {
        DispatchQueue.main.async {
          self.generateNewOTP()
        }
      }
    }
    RunLoop.main.add(newTimer, forMode: .common)
    timer = newTimer
  }
  
  private func generateNewOTP()  {
    DispatchQueue.main.async {
      self.otp = self.totp.generate(time: Date()) ?? ""
    }
  }
  
  private func remainingSeconds(for period: Int, now: Date = Date()) -> Int {
    let p = max(1, period)
    let epoch = Int(now.timeIntervalSince1970)
    let r = p - (epoch % p)
    return r == p ? 0 : r
  }
  
  // Keep this helper local to the view
  private func parseOtpItemName(_ name: String) -> [String] {
    guard !name.isEmpty else {
      return ["", ""]
    }
    let parts = name.split(separator: " ")
    guard let last = parts.last else {
      return ["", ""]
    }
    if parts.count == 1 {
      return [name, ""]
    }
    let title = parts.dropLast().joined(separator: " ")
    let otp = last.filter { $0 != "(" && $0 != ")" }
    return [title, otp]
  }
}
