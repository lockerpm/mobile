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


class CredentialProviderController: ASCredentialProviderViewController {
  private var user : User!
  private var dataModel: AutofillDataModel!
  private var serviceIdentifier: String = ""
  private var quickBar: Bool = false
  private var quickBarCredential: AutofillData!

  @IBOutlet weak var logo: UIImageView!
  
  required init?(coder: NSCoder) {
    super.init(coder: coder)
    self.user = User()
    self.dataModel = AutofillDataModel(self.user)
  }
  
  override func viewDidAppear(_ animated: Bool) {
    self.view.backgroundColor = UIColor(named: "background")
    self.navigateCredentialsList()
//    if (user.faceIdEnabled){
//      authenService.biometricAuthentication(
//        view: self,
//        onSuccess: {
//          self.navigateCredentialsList()
//        },
//        onFailed: {
//          self.navigateLockScreen()
//        }
//      )
//    }
//    else {
//      self.navigateLockScreen()
//    }
  }
 
  /*
   Prepare your UI to list available credentials for the user to choose from. The items in
   'serviceIdentifiers' describe the service the user is logging in to, so your extension can
   prioritize the most relevant credentials in the list.
  */
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    loginLocker()
    if serviceIdentifiers.count > 0 {
      self.serviceIdentifier = serviceIdentifiers[0].identifier
      if serviceIdentifiers[0].type == .URL {
        user.URI = URL(string: serviceIdentifier)?.host ?? ""
      }
      else {
        // domain
        user.URI = serviceIdentifier
        self.serviceIdentifier = "https://" +  serviceIdentifier
      }
    } else {
      user.URI = ""
    }
    
  }
  
  /**
   Implement this method if provideCredentialWithoutUserInteraction(for:) can fail with
   ASExtensionError.userInteractionRequired. In this case, the system may present your extension's
   UI and call this method. Show appropriate UI for authenticating the user then provide the password
   by completing the extension request with the associated ASPasswordCredential.
   */
  override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
    loginLocker()
    
    self.serviceIdentifier = credentialIdentity.serviceIdentifier.identifier
    self.quickBar = true
    user.URI = URL(string: serviceIdentifier)?.host ?? serviceIdentifier

    if let credential = user.getAutofillDataById(id: credentialIdentity.recordIdentifier!)  {
      self.quickBarCredential = credential
    } else {
      quickTypeBar.removeCredentialIdentities(credentialIdentity)
    }
    loadView()
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
  
  private func navigateCredentialsList() {
    let credentialsListView = CredentialsListScreen(credentials: user.credentials, cancel: {self.cancel()}, onSelect: loginSelected, uri: user.URI)
    
    self.navigateView(view: credentialsListView)
  }
  
  private func navigateLockScreen() {
    let lockView = LockScreen(user: self.user, quickBar: self.quickBar, autofillQuickTypeBar: {
      if (self.quickBarCredential == nil) {
          self.navigateCredentialsList()
      } else {
        self.completeRequest(user: self.quickBarCredential.username, password: self.quickBarCredential.password, otp: self.quickBarCredential.otp)
      }
    }, navigateCredentialsList: {
      self.navigateCredentialsList()
    }, cancel: {
      self.cancel()
    })
    
    self.navigateView(view: lockView)
  }

  private func navigateView(view: some View) -> Void {
    let hostingController = UIHostingController(rootView: view)
    hostingController.modalPresentationStyle = .fullScreen
    hostingController.isModalInPresentation = true
    self.present(hostingController, animated: true)
  }
  
  
  private func completeRequest(user: String, password: String, otp: String){
    let passwordCredential = ASPasswordCredential(user: user, password: password)
    if (!otp.isEmpty) {
      let otpString = otpService.getOTPFromUri(uri: otp)
      if (!otpString.isEmpty) {
        UIPasteboard.general.string = otpString
      }
    }
    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
  }
  
  private func loginLocker(){
    if (!user.loginedLocker){
      noti(contex: self, title: "Authentication", message:  "You must to login Locker befor using autofill service", completion: cancel)
      quickTypeBar.removeAllCredentialIdentities() // remove all credentials in store
    }
  }
  
  /*
   Close service and return to app view
   */
  func cancel() {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
  }
  
  func loginSelected(data: AutofillData) {
    quickTypeBar.replaceCredentialIdentities(identifier: self.serviceIdentifier, type: .URL, username: data.username, userID: data.id)
    completeRequest(user: data.username, password: data.password, otp: data.otp)
  }
}

