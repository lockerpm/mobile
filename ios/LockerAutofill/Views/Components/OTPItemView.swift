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
  
  @State private var otp: String = ""
  @State private var timer: Timer?
  @State private var localPeriod: Int = 30
  
  var body: some View {
    VStack(alignment: .leading) {
      HStack(alignment: .center){
        Text(item.name.capitalized)
          .font(.system(size: 16))
          .lineLimit(2)
          .padding(.trailing, 16)
          .truncationMode(.tail)
        
        Spacer()
        Text(groupString(otp))
          .font(.system(size: 16))
          .fontWeight(.bold)
          .foregroundColor(AppColors.primary)
      }
      .foregroundColor(AppColors.title)
    }
    .frame(minHeight: 44)
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
  private func groupString(_ input: String, groupSize: Int = 3, separator: String = " ") -> String {
    var result: [String] = []
    var current = ""
    
    for char in input {
      current.append(char)
      if current.count == groupSize {
        result.append(current)
        current = ""
      }
    }
    
    if !current.isEmpty {
      result.append(current)
    }
    
    return result.joined(separator: separator)
  }
}
