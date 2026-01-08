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
import SwiftOTP



@available(iOSApplicationExtension 17.0, *)
class PasskeyContext {
  var requestParameters: ASPasskeyCredentialRequestParameters?
  var registrationRequest: ASCredentialRequest? // keep minimal context
  
  // MARK: Quick type bar passkey
  var quickBarPasskeyCredentialRequest: ASPasskeyCredentialRequest?
  var quickBarPasskeyCredential: PasskeyItem?
}

@available(iOSApplicationExtension 17.0, *)
private var passkeyContext: PasskeyContext?


class CredentialProviderController: ASCredentialProviderViewController {
  private var serviceIdentifier: String = ""
  internal var quickBarCredential: AFPasswordItem!
  internal var quickBarOTP: OTPItem!
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
  @available(iOSApplicationExtension 17.0, *)
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier], requestParameters: ASPasskeyCredentialRequestParameters){
    // password
    prepareAutofillData(sID: serviceIdentifiers, mode: .fillPasskey)
    
    // passkey
    passkeyContext = PasskeyContext()
    passkeyContext?.requestParameters = requestParameters
    // Find allowed credentials hint (if server supplied allowedCredentials)
    if let allowed = requestParameters.allowedCredentials as [Data]?, !allowed.isEmpty {
      user.allowedCredentialIDs = allowed.map { $0.base64URLEncodedString() }
    }
    user.rpID = requestParameters.relyingPartyIdentifier
  }
  
  /**
   Mở List OTP
   */
  @available(iOSApplicationExtension 18.0, *)
  override func prepareOneTimeCodeCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    print("prepareOneTimeCodeCredentialList", serviceIdentifiers)
    prepareAutofillData(sID: serviceIdentifiers, mode: .fillOtp)
  }
  
  
  /**
   Mở List để chọn Các Text để fill
   */
  @available(iOSApplicationExtension 18.0, *)
  override func prepareInterfaceForUserChoosingTextToInsert() {
    print("prepareInterfaceForUserChoosingTextToInsert")
    prepareAutofillData(sID: [], mode: .fillText)
  }
  
  
  
  /**
   Implement this method if your extension supports showing credentials in the QuickType bar.
   When the user selects a credential from your app, this method will be called with the
   ASPasswordCredentialIdentity your app has previously saved to the ASCredentialIdentityStore.
   Provide the password by completing the extension request with the associated ASPasswordCredential.
   If using the credential would require showing custom UI for authenticating the user, cancel
   the request with error code ASExtensionError.userInteractionRequired.
   */
  override func provideCredentialWithoutUserInteraction(for credentialIdentity: ASPasswordCredentialIdentity) {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code:ASExtensionError.userInteractionRequired.rawValue))
  }
  @available(iOSApplicationExtension 17.0, *)
  override func provideCredentialWithoutUserInteraction(for credentialRequest: any ASCredentialRequest) {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code:ASExtensionError.userInteractionRequired.rawValue))
  }
 
  
  /**
   * Người dùng chọn Passkey từ QuickTypeBar -> mở unlock screen để xác thực
   */
  @available(iOSApplicationExtension 17.0, *)
  override func prepareInterfaceToProvideCredential(for credentialRequest: any ASCredentialRequest) {
    print("prepareInterfaceToProvideCredential 17.0", credentialRequest)
    switch credentialRequest {
    case let passwordRequest as ASPasswordCredentialRequest:
      if let passwordIdentity = passwordRequest.credentialIdentity as? ASPasswordCredentialIdentity {
        prepareInterfaceToProvideCredential(for: passwordIdentity)
      }
    case let passkeyRequest as ASPasskeyCredentialRequest:
      prepareInterfaceToProvideCredential(for: passkeyRequest)
    default:
      if #available(iOSApplicationExtension 18.0, *),
         let otpRequest = credentialRequest as? ASOneTimeCodeCredentialRequest,
         let otpIdentity = otpRequest.credentialIdentity as? ASOneTimeCodeCredentialIdentity {
            prepareInterfaceToProvideCredential(for: otpIdentity)
      }
    }
  }
  
  /**
   * Người dùng chọn OTP từ QuickTypeBar -> mở unlock screen để xác thực
   */
  @available(iOSApplicationExtension 18.0, *)
  func prepareInterfaceToProvideCredential(for otpIdentity: ASOneTimeCodeCredentialIdentity) {
    if (self.loginLocker()) {
      self.serviceIdentifier = otpIdentity.serviceIdentifier.identifier
      user.URI = URL(string: serviceIdentifier)?.host ?? serviceIdentifier
      
      if let otpItem = user.getOTPItemById(id: otpIdentity.recordIdentifier!)  {
        self.quickBarOTP = otpItem
      } else {
        quickTypeBar.removeOTPCredentialIdentities(otpIdentity)
      }
    }
  }
  
  
  /**
   * Người dùng chọn passkey từ QuickTypeBar -> mở unlock screen để xác thực
   */
  @available(iOSApplicationExtension 17.0, *)
  func prepareInterfaceToProvideCredential(for passkeyRequest: ASPasskeyCredentialRequest) {
    if let identity = passkeyRequest.credentialIdentity as? ASPasskeyCredentialIdentity {
      passkeyContext = PasskeyContext()
      passkeyContext?.quickBarPasskeyCredentialRequest = passkeyRequest
      if (self.loginLocker()) {
        if let credential = user.getPasskeyItemById(userName: identity.userName, rpId: identity.relyingPartyIdentifier) {
          passkeyContext?.quickBarPasskeyCredential = credential
        } else {
          quickTypeBar.removePasskeyCredentialIdentities(identity)
        }
      }
    }
  }
  /**
   * Người dùng chọn Password từ QuickTypeBar -> mở unlock screen để xác thực
   */
  override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
    print("prepareInterfaceToProvideCredential 12", credentialIdentity)
    if (self.loginLocker()) {
      self.serviceIdentifier = credentialIdentity.serviceIdentifier.identifier
      user.URI = URL(string: serviceIdentifier)?.host ?? serviceIdentifier
      
      if let credential = user.getPasswordItemById(id: credentialIdentity.recordIdentifier!)  {
        self.quickBarCredential = credential
      } else {
        quickTypeBar.removeCredentialIdentities(credentialIdentity)
      }
    }
  }
  
  /**
   Hiện thị giao diện cho việc tạo Passkey
   */
  @available(iOSApplicationExtension 17.0, *)
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
    case .fillOtp:
      OTPsListScreen(afd: self, userInfo: user.info)
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
        quickbarPasskeyAuthen()
        return
      }
    }
    
    if #available(iOSApplicationExtension 18.0, *) {
      if (user.mode == CredentialActions.quickBarOTP) {
        otpSelected(item: self.quickBarOTP)
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
  
  // OTP
  func otpSelected(item: OTPItem) {
    if #available(iOSApplicationExtension 18.0, *) {
      quickTypeBar.replaceOTPCredentialIdentities(identifier: self.serviceIdentifier, type: .URL, item: item)
      fillOtp(otpUri: item.otp)
    } else {
      cancel()
    }
  }
  
  // Passkey
  func passkeySelected(data: PasskeyItem) {
    if #available(iOSApplicationExtension 17.0, *) {
      quickTypeBar.replacePasskeyCredentialIdentities(data)
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

// MARK: otp
extension CredentialProviderController {  
  @available(iOSApplicationExtension 18.0, *)
  private func fillOtp(otpUri: String){
    let otpCode = otpService.getOTPFromUri(uri: otpUri).generate(time: Date()) ?? ""
    let otpCredential = ASOneTimeCodeCredential(code: otpCode)
    self.extensionContext.completeOneTimeCodeRequest(using: otpCredential, completionHandler: nil)
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
  @available(iOSApplicationExtension 17.0, *)
  func quickbarPasskeyAuthen() {
    guard
      let request = passkeyContext?.quickBarPasskeyCredentialRequest,
      let identity = request.credentialIdentity as? ASPasskeyCredentialIdentity,
      let item = passkeyContext?.quickBarPasskeyCredential
    else {
      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
      return
    }
    do {
      let assertion: ASPasskeyAssertionCredential
      if (GuidUtils.isGuid(item.credentialId)) {
        assertion = try createAssertionFromGuid(
          item: item,
          rpId: identity.relyingPartyIdentifier,
          clientDataHash: request.clientDataHash
        )
      } else {
        assertion = try createAssertionRaw(
          item: item,
          rpId: identity.relyingPartyIdentifier,
          clientDataHash: request.clientDataHash
        )
      }
      
      extensionContext.completeAssertionRequest(
        using: assertion
      )
      return
    } catch {
      print("Failed to authen with passkey: \(error)")
      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
    }
  }
  
  @available(iOSApplicationExtension 17.0, *)
  func createAndFillPasskey(id: String) {
    let registrationRequest = passkeyContext?.registrationRequest
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
      let saveItem = PasskeyItem(id: id, data: metadata)
      user.saveTempPasskey(saveItem)
      quickTypeBar.replacePasskeyCredentialIdentities(saveItem)
      extensionContext.completeRegistrationRequest(
        using: credential
      )
      return
    } catch {
      print("Failed to create passkey: \(error)")
      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
    }
  }
  
  @available(iOSApplicationExtension 17.0, *)
  func authenAndFillPasskey(item: PasskeyItem) {
    guard let requestParameters = passkeyContext?.requestParameters else { return  extensionContext.cancelRequest(withError: ASExtensionError(.failed))
    }
    do {
      let assertion: ASPasskeyAssertionCredential
      if (GuidUtils.isGuid(item.credentialId)) {
        assertion = try createAssertionFromGuid(
          item: item,
          rpId: requestParameters.relyingPartyIdentifier,
          clientDataHash: requestParameters.clientDataHash
        )
      } else {
        assertion = try createAssertionRaw(
          item: item,
          rpId: requestParameters.relyingPartyIdentifier,
          clientDataHash: requestParameters.clientDataHash
        )
      }
      
      extensionContext.completeAssertionRequest(
        using: assertion
      )
      return
    } catch {
      print("Failed to authen with passkey: \(error)")
      extensionContext.cancelRequest(withError: ASExtensionError(.failed))
    }
  }
}
