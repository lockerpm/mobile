//
//  CredentialProviderController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 21/01/2022.
//

import UIKit
import LocalAuthentication
import AuthenticationServices
import SwiftUI
import Sentry



@available(iOS 17.0, *)
class PasskeyContext {
  var requestParameters: ASPasskeyCredentialRequestParameters?
  var registrationRequest: ASCredentialRequest? // keep minimal context
}

@available(iOSApplicationExtension 17.0, *)
private var passkeyContext: PasskeyContext?


class CredentialProviderController: ASCredentialProviderViewController {
  private var serviceIdentifier: String = ""
  internal var quickBarCredential: AFPasswordItem!
  internal var user: User
  
  
  @IBOutlet weak var logo: UIImageView!
  required init?(coder: NSCoder) {
    self.user = User()
    super.init(coder: coder)
    print("init ------")
    
  }
  override func viewDidLoad() {
    super.viewDidLoad()
    print("viewDidLoad ------")
    
    SentrySDK.start { options in
      options.dsn = getStringInfo(key: "DSN_SENTRY")
      options.enableAppHangTracking = false  // Reduce resource usage
      options.enableSwizzling = false  // Avoid conflicts in the extension
      options.attachStacktrace = true
      options.sendDefaultPii = true  // Capture user details if necessary
    }
    
    i.locale = user.info?.language ?? "en"
  }
  override func viewDidAppear(_ animated: Bool) {
    print("viewDidAppear -----")
    self.view.backgroundColor = UIColor(named: "background")
    self.startExtension()
  }
  
  /*
   Mở List Passwords
   */
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    print("prepareCredentialList 16", serviceIdentifiers)
    prepareAutofillData(sID: serviceIdentifiers, mode: .fillPassword)
  }
  
  /**
   Mở List Passwords + Passkeys, Khi chọn Passkeys thì dùng requestParameters
   */
  @available(iOS 17.0, *)
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier], requestParameters: ASPasskeyCredentialRequestParameters){
    // test
    print("prepareCredentialList 17", serviceIdentifiers, requestParameters.relyingPartyIdentifier)
    passkeyContext = PasskeyContext()
    passkeyContext?.requestParameters = requestParameters
    
    prepareAutofillData(sID: serviceIdentifiers, mode: .fillPasskey)
    
    // Find allowed credentials hint (if server supplied allowedCredentials)
    if let allowed = requestParameters.allowedCredentials as [Data]?, !allowed.isEmpty {
      user.allowedCredentialIDs = allowed.map { $0.base64URLEncodedString() }
    }
    
    user.URI = requestParameters.relyingPartyIdentifier
  }
  
  /**
   Mở List OTP
   */
  @available(iOS 18.0, *)
  override func prepareOneTimeCodeCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    
    print("prepareCredentialList", serviceIdentifiers)
    prepareAutofillData(sID: serviceIdentifiers, mode: .fillOtp)
  }
  
  
  /**
   Mở List để chọn Các Text để fill
   */
  @available(iOS 18.0, *)
  override func prepareInterfaceForUserChoosingTextToInsert() {
    print("prepareInterfaceForUserChoosingTextToInsert")
    prepareAutofillData(sID: [], mode: .fillText)
  }
  
  /**
   * Người dùng chọn Passkey từ QuickTypeBar -> mở unlock screen để xác thực
   */
  @available(iOS 17.0, *)
  override func prepareInterfaceToProvideCredential(for credentialRequest: any ASCredentialRequest) {
    user.mode = .quickBarPasskey
    // test
    print("prepareInterfaceToProvideCredential", credentialRequest)
  }
  /**
   * Người dùng chọn Password từ QuickTypeBar -> mở unlock screen để xác thực
   */
  override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
    user.mode = .quickBarPassword
    print("prepareInterfaceToProvideCredential", credentialIdentity)
    if (self.loginLocker()) {
      self.serviceIdentifier = credentialIdentity.serviceIdentifier.identifier
      user.URI = URL(string: serviceIdentifier)?.host ?? serviceIdentifier
      
      if let credential = user.getPasswordItemById(id: credentialIdentity.recordIdentifier!)  {
        self.quickBarCredential = credential
      } else {
        quickTypeBar.removeCredentialIdentities(credentialIdentity)
      }
      loadView()
    }
  }
  
  /**
   Hiện thị giao diện cho việc tạo Passkey
   */
  @available(iOS 17.0, *)
  override func prepareInterface(forPasskeyRegistration registrationRequest: any ASCredentialRequest) {
    print("prepareInterface forPasskeyRegistration ")
    
    guard
      let passkeyReq = registrationRequest as? ASPasskeyCredentialRequest,
      let identity = passkeyReq.credentialIdentity as? ASPasskeyCredentialIdentity
    else {
      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
      return
    }

    passkeyContext = PasskeyContext()
    passkeyContext?.registrationRequest = registrationRequest
    prepareAutofillData(sID: [], mode: .createPasskey)

    // use this to check for duplicates
    user.newPasskeyUsername = identity.userName
    user.newPasskeyRpID = identity.relyingPartyIdentifier
    loadView()
  }
  
  
  private func loginLocker() -> Bool {
    if (!user.loginedLocker) {
      noti(contex: self, title: "noti.authen", message:  "noti.loginLocker", completion: cancel)
      quickTypeBar.removeAllCredentialIdentities() // remove all credentials in store
      return false
    }
    return true
  }
  
  private func startExtension() {
//    unlockSuccess()
    if (self.loginLocker()) {
      if (user.faceIdEnabled){
        authenService.biometricAuthentication(
          view: self,
          onSuccess: unlockSuccess,
          onFailed: navigateLockScreen,
          notSupported: navigateLockScreen
        )
      }
      else {
        self.navigateLockScreen()
      }
    }
  }
  
  private func prepareAutofillData(sID: [ASCredentialServiceIdentifier], mode: CredentialActions) {
    if sID.count > 0 {
      self.serviceIdentifier = sID[0].identifier
      if sID[0].type == .URL {
        user.setUri(uri: URL(string: serviceIdentifier)?.host ?? "", isDomain: false)
      } else {
        user.setUri(uri: serviceIdentifier, isDomain: true)
        self.serviceIdentifier = "https://" +  serviceIdentifier
      }
    }
    
    user.getData(mode: mode)
  }
}


// MARK: Navigator
extension CredentialProviderController {
  @ViewBuilder
  private func getTargetViewAfterUnlock() -> some View {
    switch user.mode {
    case .fillPassword:
      PasswordsListScreen(afd: self, userInfo: user.info)
    case .fillPasskey:
      PasskeysListScreen(afd: self, userInfo: user.info)
    case .createPasskey:
      CreatePasskeyScreen(afd: self, userInfo: user.info)
    default:
      PasswordsListScreen(afd: self, userInfo: user.info)
    }
  }
  private func navigateToTargetView() {
    let target = getTargetViewAfterUnlock()
    self.navigateView(view: target)
  }
  
  private func navigateLockScreen() {
    let target = getTargetViewAfterUnlock()
    let lockView = LockScreen(afd: self, userInfo: user.info, target: target)
    self.navigateView(view: lockView)
  }
  
  private func navigateView(view: some View) -> Void {
    let hostingController = UIHostingController(rootView: view)
    hostingController.modalPresentationStyle = .fullScreen
    hostingController.isModalInPresentation = true
    self.present(hostingController, animated: true)
  }
}

// MARK: Autofill Actions
extension CredentialProviderController: AutofillScreenDelegate {
  func cancel() {
    extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
  }
  
  // Called back after successful user authentication using biometric or master password
  func unlockSuccess() {
    if (user.mode == CredentialActions.quickBarPassword) {
      passwordSelected(data: self.quickBarCredential)
      return
    }
    
    if #available(iOSApplicationExtension 17.0, *) {
      if (user.mode == CredentialActions.quickBarPasskey) {
        print("quickBarPasskey")
        return
      }
    }
    
    navigateToTargetView()
  }
  
  // Password generated
  func passwordSelected(password: String) {
    fillPassword(user: "", password: password, otp: "")
  }
  func createPasswordItem(item: TempPasswordItem) {
    user.saveTempPassword(item)
    fillPassword(user: item.username, password: item.password, otp: "")
  }
  func passwordSelected(data: AFPasswordItem) {
    quickTypeBar.replaceCredentialIdentities(identifier: self.serviceIdentifier, type: .URL, username: data.login.username, userID: data.login.id)
    fillPassword(user: data.login.username, password: data.login.password, otp: data.login.otp)
  }
  
  
  // Passkey
  func passkeySelected(data: PasskeyItem) {
    if #available(iOSApplicationExtension 17.0, *) {
      authenAndFillPasskey(item: data)
    } else {
      cancel()
    }
  }
  
  func passkeyRegistration(id: String) {
    if #available(iOSApplicationExtension 17.0, *) {
      createAndFillPasskey(id: id)
    } else {
      cancel()
    }
  }
}


// MARK: Password
extension CredentialProviderController {
  private func fillPassword(user: String, password: String, otp: String){
    let passwordCredential = ASPasswordCredential(user: user, password: password)
    if (!otp.isEmpty) {
      let otpString = otpService.getOTPFromUri(uri: otp).generate(time: Date()) ?? ""
      if (!otpString.isEmpty) {
        UIPasteboard.general.string = otpString
      }
    }
    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
  }
}


// MARK: Passkey
extension CredentialProviderController {
  @available(iOS 17.0, *)
  func createAndFillPasskey(id: String) {
    let registrationRequest = passkeyContext?.registrationRequest
    print("PasskeyRegistration start")
    
    guard
      let passkeyReq = registrationRequest as? ASPasskeyCredentialRequest,
      let identity = passkeyReq.credentialIdentity as? ASPasskeyCredentialIdentity
    else {
      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
      return
    }
    
    do {
      let (credential, metadata) = try createPasskeyRegistrationCredential(
        passkeyReq: passkeyReq,
        passkeyId: identity
      )
      
      user.saveTempPasskey(id: id, data: metadata)
      extensionContext.completeRegistrationRequest(
        using: credential
      )
      
      print("PasskeyRegistration end--")
      return
    } catch {
      print("Failed to create passkey: \(error)")
      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
    }
  }
  
  @available(iOS 17.0, *)
  func authenAndFillPasskey(item: PasskeyItem) {
    guard let requestParameters = passkeyContext?.requestParameters else { return  extensionContext.cancelRequest(withError: ASExtensionError(.failed))
    }
    print("PasskeyAuthentication start")
    
    do {
      let assertion = try createAssertionFromTempPasskey(
        item: item,
        requestParams: requestParameters
      )
      
      extensionContext.completeAssertionRequest(
        using: assertion
      )
      print("PasskeyAuthentication end--")
      return
    } catch {
      print("Failed to authen with passkey: \(error)")
      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
    }
  }
}
