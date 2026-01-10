//
//  Untitled.swift
//  Locker
//
//  Created by Nguyen Thinh on 6/1/26.
//

import SwiftUI
import SwiftOTP

struct OTPsListScreen: View {
  var afd: AutofillScreenDelegate // autofill delegate
  var userInfo: UserInfo
  
  @State private var searchText = ""
  @State private var isInitSearch = false
  
  // Countdown state for the first OTP (from the whole dataset, not filtered)
  @State private var firstOTPCode: String = ""
  @State private var firstOTPRemaining: Int = 0
  @State private var firstOTPPeriod: Int = 30
  @State private var firstOTPTimer: Timer?
  
  // if user search for domain or url with no result. show suggest search text for best resutl
  var suggestSearchs: [String] {
    parseDomain(of: afd.user.URI)
  }
  
  var initSearch: String {
    if suggestSearchs.isEmpty {
      return ""
    } else {
      return suggestSearchs[0]
    }
  }
  
  // Use first OTP from all data (not filtered) for the countdown
  private var firstOTPItem: OTPItem? {
    afd.user.afOTPs.first
  }
  
  // Derived flags/data
  private var hasData: Bool {
    !afd.user.afOTPs.isEmpty
  }
  
  // Filtered list
  var otps: [OTPItem] {
    let source = searchText.isEmpty
    ? afd.user.afOTPs
    : afd.user.afOTPs
      .filter { $0.name.lowercased().contains(searchText.lowercased()) }
    return source
  }
  
  var body: some View {
    NavigationView{
      List {
        // Global empty state (no OTPs at all)
        if !hasData {
          VStack(spacing: 8) {
            Text(
              i.translate("otp.t")
            ) // fallback key; adjust to your localization keys
            .font(.system(size: 16, weight: .semibold))
            .foregroundStyle(AppColors.title)
           
          }
          .frame(maxWidth: .infinity, alignment: .center)
          .padding(.vertical, 24)
          .listRowBackground(Color.clear)
        } else {
          // Has data: handle search empty vs results
          if !searchText.isEmpty && otps.isEmpty {
            Text(i.translate("list.noDataSearch") +  " '\(searchText)'")
              .foregroundStyle(AppColors.label)
            if searchText == initSearch &&  suggestSearchs.count > 1{
              Text(i.translate("list.suggestSearch") )
                .foregroundStyle(AppColors.label)
              ForEach(
                suggestSearchs[1..<suggestSearchs.count],
                id: \.self
              ) { searchText in
                Button {
                  self.searchText = searchText
                } label: {
                  Text(searchText)
                }
              }
            }
          } else {
            ForEach(otps, id: \.id) { code in
              Button {
                onClickOtp(data: code)
              } label: {
                if #available(iOS 17.0, *) {
                  OtpItemView(item: code, globalRemaining: firstOTPRemaining)
                } else {
                  Text(code.name)
                }
              }
            }
          }
        }
      }
      .padding(.top, -24)
      .onAppear{
        if !isInitSearch {
          self.isInitSearch = true
          self.searchText = initSearch
        }
        // Only start the global countdown if we have at least one OTP
        if hasData {
          startFirstOTPTimer()
        }
      }
      .onDisappear {
        firstOTPTimer?.invalidate()
        firstOTPTimer = nil
      }
      .foregroundStyle(AppColors.title)
      .autocapitalization(.none)
      .navigationTitle(i.translate("otp.t"))
      .toolbar {
        // Small text above title (principal placement)
        ToolbarItem(placement: .principal) {
          VStack(spacing: 2) {
            Text(i.translate("otp.t"))
            if (hasData) {
              // Show remaining seconds next to the label
              Text("\(i.translate("totp.update")) \(max(0, firstOTPRemaining))")
                .font(.system(size: 12))
                .foregroundStyle(AppColors.label)
            }
          }
        }
        // Trailing circular countdown (smaller, no text)
        ToolbarItem(placement: .navigationBarTrailing) {
          if (hasData) {
            CircleCountdownView(
              remaining: firstOTPRemaining,
              period: firstOTPPeriod
            )
            .frame(width: 24, height: 24)
          }
        }
        ToolbarItem(placement: .navigationBarLeading) {
          Button(i.translate("c.cancel")) {
            afd.cancel()
          }
        }
      }
      .navigationBarTitleDisplayMode(.inline)
    }
    .searchable(
      text: $searchText,
      placement: .navigationBarDrawer(displayMode: .always)
    )
    .navigationBarHidden(true)
    .navigationBarBackButtonHidden()
    .background(AppColors.background)
  }
  
  func onClickOtp(data: OTPItem) {
    if (afd.user.mode == .fillText) {
      let otpCode = otpService.getOTPFromUri(uri: data.otp).generate(time: Date()) ?? ""
      afd.textSelected(data: otpCode)
    } else {
      afd.otpSelected(data: data)
    }
  }
  
  // Helper to compute remaining for a given period
  private func computeRemaining(for period: Int, now: Date = Date()) -> Int {
    let p = max(1, period)
    let epoch = Int(now.timeIntervalSince1970)
    let r = p - (epoch % p)
    return r == p ? 0 : r
  }
  
  // Build TOTP from a URL/secret
  private func makeTOTP(from uri: String) -> TOTP {
    otpService.getOTPFromUri(uri: uri)
  }
  
  // Start/Restart timer for the first OTP
  private func startFirstOTPTimer() {
    firstOTPTimer?.invalidate()
    guard let first = firstOTPItem else { return }
    let totp = makeTOTP(from: first.otp)
    // Capture period from the TOTP (SwiftOTP’s timeInterval is Double)
    let period = Int(totp.timeInterval)
    firstOTPPeriod = max(1, period)
    // Seed initial state
    firstOTPCode = totp.generate(time: Date()) ?? ""
    firstOTPRemaining = computeRemaining(for: firstOTPPeriod)
    
    let timer = Timer(timeInterval: 1, repeats: true) { _ in
      let remaining = computeRemaining(for: firstOTPPeriod)
      DispatchQueue.main.async {
        self.firstOTPRemaining = remaining
        if remaining == 0 {
          self.firstOTPCode = totp.generate(time: Date()) ?? ""
        }
      }
    }
    RunLoop.main.add(timer, forMode: .common)
    firstOTPTimer = timer
  }
}

// Simple circular countdown using a trimmed Circle
private struct CircleCountdownView: View {
  let remaining: Int
  let period: Int
  
  private var progress: CGFloat {
    guard period > 0 else { return 0 }
    // progress from 1.0 (full) down to 0.0 (empty)
    return CGFloat(max(0, min(period, remaining))) / CGFloat(period)
  }
  
  var body: some View {
    ZStack {
      Circle()
        .stroke(AppColors.border, lineWidth: 2)
      Circle()
        .trim(from: 0, to: progress)
        .stroke(
          AppColors.primary,
          style: StrokeStyle(lineWidth: 5, lineCap: .round)
        )
        .rotationEffect(.degrees(-90))
    }
    .padding(.all, 4)
  }
}
