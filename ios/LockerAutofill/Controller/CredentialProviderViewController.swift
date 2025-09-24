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
}

@available(iOSApplicationExtension 17.0, *)
private var passkeyContext: PasskeyContext?   // ✅ always safe



class CredentialProviderController: ASCredentialProviderViewController {
  private var serviceIdentifier: String = ""
   
  internal var user: User
  internal var quickBar: Bool = false
  internal var quickBarCredential: AFPasswordItem!
  
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
   
    if (self.loginLocker()) {
      if (user.faceIdEnabled){
        authenService.biometricAuthentication(
          view: self,
          onSuccess: {
            if (self.quickBarCredential == nil) {
              self.navigateCredentialsList()
            } else {
              self.loginSelected(data: self.quickBarCredential)
            }
          },
          onFailed: self.navigateLockScreen,
          notSupported: {
            self.navigateLockScreen()
          }
        )
      }
      else {
        self.navigateLockScreen()
      }
    }
  }
  
  /*
    Mở List Passwords
   */
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    print("prepareCredentialList", serviceIdentifiers)
    prepareAutofillData(sID: serviceIdentifiers, mode: .password)
  }
  
  /**
    Mở List Passwords + Passkeys, Khi chọn Passkeys thì dùng requestParameters
   */
  @available(iOS 17.0, *)
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier], requestParameters: ASPasskeyCredentialRequestParameters){
    // test
    print("prepareCredentialList", serviceIdentifiers, requestParameters.relyingPartyIdentifier)
    passkeyContext = PasskeyContext()
    passkeyContext?.requestParameters = requestParameters
    
    prepareAutofillData(sID: serviceIdentifiers, mode: .passwordVsPasskey)
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
    if (self.loginLocker()) {
      self.serviceIdentifier = credentialIdentity.serviceIdentifier.identifier
      self.quickBar = true
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
    // test
    print("prepareInterface", registrationRequest)
  }
  
  /**
   Tạo passkey mà ko hiện gì
   TODO: chấm hỏi, test sau)
   */
  @available(iOS 18.0, *)
  override func performWithoutUserInteractionIfPossible(passkeyRegistration registrationRequest: ASPasskeyCredentialRequest) {
    // test
    print("prepareInterface", registrationRequest)
  }
  
  // Unsupported
  @available(iOS 17.0, *)
  override func provideCredentialWithoutUserInteraction(for credentialRequest: any ASCredentialRequest) {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code:ASExtensionError.userInteractionRequired.rawValue))
  }
  
  // Unsupported
  override func provideCredentialWithoutUserInteraction(for credentialIdentity: ASPasswordCredentialIdentity) {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code:ASExtensionError.userInteractionRequired.rawValue))
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
          onSuccess: {
            if (self.quickBarCredential == nil) {
              self.navigateCredentialsList()
            } else {
              self.loginSelected(data: self.quickBarCredential)
            }
          },
          onFailed: self.navigateLockScreen,
          notSupported: {
            self.navigateLockScreen()
          }
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



/**
 Navigation
 */
extension CredentialProviderController {
  private func navigateCredentialsList() {
    let credentialsListView = PasswordsListScreen(afd: self, userInfo: user.info)
    self.navigateView(view: credentialsListView)
  }
  
  private func navigateLockScreen() {
    let lockView = LockScreen(afd: self, userInfo: user.info)
    self.navigateView(view: lockView)
  }
  
  private func navigateView(view: some View) -> Void {
    let hostingController = UIHostingController(rootView: view)
    hostingController.modalPresentationStyle = .fullScreen
    hostingController.isModalInPresentation = true
    self.present(hostingController, animated: true)
  }
}

/**
 Autofill Actions
 */
extension CredentialProviderController: AutofillScreenDelegate {
  func passwordSelected(password: String) {
    completeRequest(user: "", password: password, otp: "")
  }
  
  func createLoginItem(item: TempPasswordItem) {
    user.saveTempPassword(item)
    completeRequest(user: item.username, password: item.password, otp: "")
  }
  
  func cancel() {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
  }
  
  func loginSelected(data: AFPasswordItem) {
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
