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

enum CredentialActions {
  case fillRequest
  case quickBarPassword
  case quickBarPasskey
  case createPasskey
}

class CredentialProviderController: ASCredentialProviderViewController {
  private var serviceIdentifier: String = ""
  internal var quickBarCredential: AFPasswordItem!
  internal var action: CredentialActions = .fillRequest
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
    prepareAutofillData(sID: serviceIdentifiers, mode: .password)
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
    
    prepareAutofillData(sID: serviceIdentifiers, mode: .passkey)
  }
  
  /**
   Mở List OTP
   */
  @available(iOS 18.0, *)
  override func prepareOneTimeCodeCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    
    print("prepareCredentialList", serviceIdentifiers)
    prepareAutofillData(sID: serviceIdentifiers, mode: .otp)
  }
  
  
  /**
   Mở List để chọn Các Text để fill
   */
  @available(iOS 18.0, *)
  override func prepareInterfaceForUserChoosingTextToInsert() {
    print("prepareInterfaceForUserChoosingTextToInsert")
    prepareAutofillData(sID: [], mode: .text)
  }
  
  /**
   * Người dùng chọn Passkey từ QuickTypeBar -> mở unlock screen để xác thực
   */
  @available(iOS 17.0, *)
  override func prepareInterfaceToProvideCredential(for credentialRequest: any ASCredentialRequest) {
    // test
    print("prepareInterfaceToProvideCredential", credentialRequest)
  }
  /**
   * Người dùng chọn Password từ QuickTypeBar -> mở unlock screen để xác thực
   */
  override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
    self.action = .quickBarPassword
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
    self.action = .createPasskey
    passkeyContext = PasskeyContext()
    passkeyContext?.registrationRequest = registrationRequest
    
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
  
  private func prepareAutofillData(sID: [ASCredentialServiceIdentifier], mode: AutofillMode) {
    if sID.count > 0 {
      self.serviceIdentifier = sID[0].identifier
      if sID[0].type == .URL {
        user.setUri(uri: URL(string: serviceIdentifier)?.host ?? "", isDomain: false)
      } else {
        user.setUri(uri: serviceIdentifier, isDomain: true)
        self.serviceIdentifier = "https://" +  serviceIdentifier
      }
    } else {
      user.URI = ""
    }
    
    user.getData(mode: mode)
  }
}


// MARK: Navigator
extension CredentialProviderController {
  @ViewBuilder
  private func getTargetViewAfterUnlock() -> some View {
    switch user.filleMode {
    case .otp:
      PasswordsListScreen(afd: self, userInfo: user.info)
    case .password:
      PasswordsListScreen(afd: self, userInfo: user.info)
    case .passkey:
      PasskeysListScreen(afd: self, userInfo: user.info)
    case .passwordVsPasskey:
      PasswordsListScreen(afd: self, userInfo: user.info)
    case .text:
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
  func unlockSuccess() {
    if (action == CredentialActions.quickBarPassword) {
      passwordSelected(data: self.quickBarCredential)
      return
    }
    
    if (action == CredentialActions.fillRequest) {
      navigateToTargetView()
      return
    }
    if #available(iOSApplicationExtension 17.0, *) {
      if (action == CredentialActions.createPasskey) {
        createAndFillPasskey()
        return
      }
    }
    if (action == CredentialActions.quickBarPasskey) {
      print("quickBarPasskey")
      return
    }
  }
  
  func passwordSelected(password: String) {
    completeRequest(user: "", password: password, otp: "")
  }
  
  func createPasswordItem(item: TempPasswordItem) {
    user.saveTempPassword(item)
    completeRequest(user: item.username, password: item.password, otp: "")
  }
  
  func cancel() {
    extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
  }
  
  func passwordSelected(data: AFPasswordItem) {
    quickTypeBar.replaceCredentialIdentities(identifier: self.serviceIdentifier, type: .URL, username: data.login.username, userID: data.login.id)
    completeRequest(user: data.login.username, password: data.login.password, otp: data.login.otp)
  }
  
  private func completeRequest(user: String, password: String, otp: String){
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
  func createAndFillPasskey() {
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
      let (credential, metadata) = try passkeyRegistration(
        passkeyReq: passkeyReq,
        passkeyId: identity
      )
      
      user.saveTempPasskey(metadata)
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
  func authenAndFillPasskey() {
    let requestParameters = passkeyContext?.requestParameters
    print("PasskeyAuthentication start")
    
//    guard
//      let passkeyReq = registrationRequest as? ASPasskeyCredentialRequest,
//      let identity = passkeyReq.credentialIdentity as? ASPasskeyCredentialIdentity
//    else {
//      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
//      return
//    }
//    
//    do {
//      let (credential, metadata) = try passkeyRegistration(
//        passkeyReq: passkeyReq,
//        passkeyId: identity
//      )
//      extensionContext.completeRegistrationRequest(
//        using: credential
//      )
//      print("PasskeyRegistration end--")
//      return
//    } catch {
//      print("Failed to create passkey: \(error)")
//      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
//    }
  }
}
