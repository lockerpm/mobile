import SwiftUI
import SwiftOTP

struct CredentialDetailScreen: View {
  var afd: AutofillScreenDelegate
  var userInfo: UserInfo
  var item: AFPasswordItem
  
  // Local states for displaying values (not editable now)
  @State private var username: String = ""
  @State private var password: String = ""
  @State private var url: String = ""
  
  // Password visibility
  @State private var showPassword: Bool = false
  
  // Toast state
  @State private var showCopiedToast: Bool = false
  
  var body: some View {
    ZStack(alignment: .top) {
      ScrollView {
        VStack(alignment: .leading, spacing: 12) {
          // Header section block
          sectionBlock {
            headerSection
          }
          
          // Content section block
          sectionBlock {
            contentSection
          }
          
          // Primary action (non-fillText modes)
          if afd.user.mode == .fillPassword && !password.isEmpty {
            Button {
              afd.passwordSelected(data: item)
            } label: {
              Text(i.translate("pw.fill"))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .foregroundStyle(.white)
                .background(AppColors.primary)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            .padding(.top, 4)
          }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 16)
      }
      .background(Color(.secondarySystemBackground))
      .navigationBarTitleDisplayMode(.inline)
      .onAppear {
        // seed display states
        username = item.login.username
        password = item.login.password
        url = item.login.uri
      }
      
      // Toast
      if showCopiedToast {
        Text(i.translate("c.copied"))
          .padding(.horizontal, 16)
          .padding(.vertical, 8)
          .background(
            RoundedRectangle(cornerRadius: 8)
              .fill(Color.black.opacity(0.7))
          )
          .foregroundColor(.white)
          .transition(.opacity)
          .padding(.top, 8)
      }
    }
    .animation(.easeInOut(duration: 0.2), value: showCopiedToast)
  }
  
  // MARK: - Sections
  
  // Header with bordered, centered name field styled like other fields
  private var headerSection: some View {
    HStack(spacing: 8) {
      PasswordImage(itemUri: item.login.uri)
        .frame(width: 48, height: 48)

      ZStack(alignment: .topLeading) {
        // Bordered container
        RoundedRectangle(cornerRadius: 8)
          .stroke(AppColors.border, lineWidth: 1)
        
        // Content HStack
        HStack(spacing: 8) {
          Text(item.login.name)
            .foregroundStyle(AppColors.title)
            .lineLimit(1)
            .font(.title3)
            .truncationMode(.middle)
            .padding(.vertical, 10)
            .padding(.horizontal, 12)
          
          Spacer()
        }
      }
      .frame(minHeight: 44)
      .contentShape(Rectangle())
    }
  }
  
  private var contentSection: some View {
    VStack(alignment: .leading, spacing: 0) {
      // Username field
      if !username.isEmpty {
        readOnlyField(
          label: i.translate("item.username"),
          value: username,
          isPassword: false
        )
      }
      
      // Password field with eye toggle
      if !password.isEmpty {
        readOnlyField(
          label: i.translate("item.password"),
          value: password,
          isPassword: true,
          hidePassword: item.login.hidePassword
        )
      }
      
      // URL field (if present and not placeholder)
      if !url.isEmpty && url != "https://" {
        readOnlyField(
          label: "URL",
          value: url,
          isPassword: false
        )
      }
      
      // OTP section
      if !item.login.otp.isEmpty {
        DetailTOTPView(url: item.login.otp, onPress: handleTapAction, isFillPassword: afd.user.mode == .fillPassword)

      }
    }
  }
  
  // MARK: - Components
  
  // Non-editable, tappable field with floating top-left label and optional eye toggle for password
  private func readOnlyField(label: String, value: String, isPassword: Bool, hidePassword: Bool = false) -> some View {
    ZStack(alignment: .topLeading) {
      // Bordered container
      RoundedRectangle(cornerRadius: 8)
        .stroke(AppColors.border, lineWidth: 1)

      // Content HStack
      HStack(spacing: 8) {
        let displayText: String = {
          if isPassword && (!showPassword || hidePassword) {
            return String(repeating: "•", count: max(4, min(12, value.count)))
          }
          return value
        }()

        Text(displayText)
          .foregroundStyle(AppColors.title)
          .lineLimit(1)
          .truncationMode(.middle)
          .padding(.vertical, 10)
          .padding(.horizontal, 12)

        Spacer()

        if isPassword && !hidePassword {
          Button {
            withAnimation(.easeInOut(duration: 0.15)) {
              showPassword.toggle()
            }
          } label: {
            Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
              .foregroundStyle(AppColors.label)
              .padding(.trailing, 12)
          }
        }
      }

      // Floating label pinned to top-left
      Text(label)
        .font(.subheadline)
        .foregroundStyle(AppColors.label)
        .padding(.horizontal, 6)
        .background(AppColors.background)
        .offset(x: 4, y: -10)
    }
    .frame(minHeight: 44)
    .padding(.vertical, 12) // add space between fields
    .contentShape(Rectangle()) // make the whole area tappable
    .onTapGesture {
      // Tapping anywhere triggers action (except the eye button which handles its own tap).
      // When hidePassword is set, suppress tap-to-copy / tap-to-fillText so plaintext can't leak.
      if isPassword && hidePassword { return }
      handleTapAction(value: value)
    }
  }
  
  // Handle tap depending on mode: fill text vs copy to clipboard + toast
  private func handleTapAction(value: String) {
    if afd.user.mode == .fillText {
      afd.textSelected(data: value)
    } else {
      UIPasteboard.general.string = value
      showCopiedToast = true
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
        withAnimation {
          showCopiedToast = false
        }
      }
    }
  }
  
  // Wrap any content with primary block styling (background, padding 16, border)
  private func sectionBlock<Content: View>(@ViewBuilder content: () -> Content) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      content()
        .padding(12) // decreased padding inside header/content blocks
        .background(AppColors.background)
        .overlay(
          RoundedRectangle(cornerRadius: 12)
            .stroke(AppColors.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
  }
}


private struct DetailTOTPView: View {
  var url: String
  var onPress: (_: String) -> Void
  var isFillPassword: Bool = false
  
  // Countdown state for the OTP
  @State private var otp: String = ""
  @State private var remaining: Int = 0
  @State private var period: Int = 30
  @State private var otpTimer: Timer?

  var body: some View {
    VStack(alignment: .leading) {
      ZStack(alignment: .topLeading) {
        // Bordered container
        RoundedRectangle(cornerRadius: 8)
          .stroke(AppColors.border, lineWidth: 1)
        
        // Content HStack
        HStack(spacing: 8) {
          Text(otp)
            .foregroundStyle(AppColors.title)
            .lineLimit(1)
            .truncationMode(.middle)
            .padding(.vertical, 10)
            .padding(.horizontal, 12)
          
          Spacer()
          CircleCountdownView(
            remaining: remaining,
            period: period
          )
          .frame(width: 24, height: 24)
          .padding(.trailing, 12)
        }
        
        // Floating label pinned to top-left
        Text("OTP")
          .font(.subheadline)
          .foregroundStyle(AppColors.label)
          .padding(.horizontal, 6)
          .background(AppColors.background)
          .offset(x: 4, y: -10)
      }
      .frame(minHeight: 44)
      .padding(.vertical, 12) // add space between fields
      .contentShape(Rectangle()) // make the whole area tappable
      .onTapGesture {
        // Tapping anywhere triggers action (except the eye button which handles its own tap)
        onPress(otp)
      }

      if isFillPassword {
        Text(i.translate("totp.desc"))
          .foregroundStyle(AppColors.label)
          .font(.system(size: 14))
      }
    }
    .onAppear {
      startOTPTimer()
    }
    .onDisappear {
      otpTimer?.invalidate()
      otpTimer = nil
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
  private func startOTPTimer() {
    otpTimer?.invalidate()
    let totp = makeTOTP(from: url)
    
    // Capture period from the TOTP (SwiftOTP’s timeInterval is Double)
    let period = Int(totp.timeInterval)
    self.period = max(1, period)
    // Seed initial state
    otp = totp.generate(time: Date()) ?? ""
    remaining = computeRemaining(for: period)
    
    let timer = Timer(timeInterval: 1, repeats: true) { _ in
      let remaining = computeRemaining(for: period)
      DispatchQueue.main.async {
        self.remaining = remaining
        if remaining == 0 {
          self.otp = totp.generate(time: Date()) ?? ""
        }
      }
    }
    RunLoop.main.add(timer, forMode: .common)
    otpTimer = timer
  }
}
