//
//  CredentialProviderController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 21/01/2022.
//

import UIKit
import LocalAuthentication
import AuthenticationServices


class CredentialProviderController: ASCredentialProviderViewController {
  private var dataModel: AutofillDataModel = AutofillDataModel()
  private var serviceIdentifier: String = ""
  private var quickBar: Bool = false
  private var quickBarCredential: AutofillData!
  
  @IBOutlet weak var logo: UIImageView!
  
  
  override func viewDidAppear(_ animated: Bool) {
   if (self.dataModel.faceIdEnabled){
      Utils.BiometricAuthentication(
        view: self,
        onSuccess: quickBar ? quickBarAuthenSuccess : performLoginListScreen,
        onFailed: performVerifyPasswordScreen
      )
    }
    else {
      performVerifyPasswordScreen()
    }
  }
  
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    loginLocker()
    if serviceIdentifiers.count > 0 {
      self.serviceIdentifier = serviceIdentifiers[0].identifier
      if serviceIdentifiers[0].type == .URL {
        self.dataModel.fetchAutofillData(identifier:  URL(string: serviceIdentifier)?.host ?? "")
      }
      else {
        // domain
        self.dataModel.fetchAutofillData(identifier: serviceIdentifier)
        self.serviceIdentifier = "https://" +  serviceIdentifier
      }
    } else {
      self.dataModel.fetchAutofillData(identifier: "")
    }
    
  }
  
  override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
    loginLocker()
    
    self.serviceIdentifier = credentialIdentity.serviceIdentifier.identifier
    self.quickBar = true
  
    self.dataModel.fetchAutofillData(identifier: URL(string: serviceIdentifier)?.host ?? serviceIdentifier)
    if let credential = self.dataModel.getAutofillDataById(id: credentialIdentity.recordIdentifier!)  {
      self.quickBarCredential = credential
    } else {
      AutofillHelpers.RemoveCredentialIdentities(credentialIdentity)
    }
    loadView()
  }

  override func provideCredentialWithoutUserInteraction(for credentialIdentity: ASPasswordCredentialIdentity) {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code:ASExtensionError.userInteractionRequired.rawValue))
  }


  override func prepare(for segue: UIStoryboardSegue, sender: Any?)
  {
    if (self.dataModel.loginedLocker){
      if segue.identifier == "loginListSegue"
      {
        let loginListView = (segue.destination as! UINavigationController).topViewController as! LoginListViewController
        loginListView.delegate = self
        loginListView.credentials = self.dataModel.credentials
        
      } else if segue.identifier == "verifyMasterPasswordSegue" {
        let verifyMasterPasswordScreen = segue.destination as! VerifyMasterPasswordViewController
        verifyMasterPasswordScreen.delegate = self
      }
    }
  }
  private func performVerifyPasswordScreen(){
     performSegue(withIdentifier: "verifyMasterPasswordSegue", sender: self)
  }
  
  private func performLoginListScreen(){
      performSegue(withIdentifier: "loginListSegue", sender: self)
  }
  
  private func completeRequest(user: String, password: String, otp: String){
    let passwordCredential = ASPasswordCredential(user: user, password: password)
    if (!otp.isEmpty) {
      let otpString = Utils.GetOTPFromUri(uri: otp)
      if (!otpString.isEmpty) {
        UIPasteboard.general.string = otpString
      }
    }
    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
  }
  
  private func loginLocker(){
    if (!self.dataModel.loginedLocker){
      Utils.Noti(contex: self, title: "Authentication", message:  "You must to login Locker befor using autofill service", completion: cancel)
      AutofillHelpers.RemoveAllCredentialIdentities() // remove all credentials in store
    }
  }
  
  func cancel() {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
  }
}


extension CredentialProviderController: VerifyMasterPasswordDelegate {
  var userAvatar: String! {
    return self.dataModel.userAvatar
  }
  var userEmail: String! {
    return self.dataModel.email
  }
  
  var hassMasterPass: String! {
    return self.dataModel.hashMassterPass
  }
  
  var authenQuickBar: Bool {
    return self.quickBar
  }
  
  var faceidEnabled: Bool {
    return self.dataModel.faceIdEnabled
  }
  
  func authenSuccess() {
    performLoginListScreen()
  }
  
  func quickBarAuthenSuccess() {
    if (self.quickBarCredential == nil) {
      performLoginListScreen()
    } else {
      completeRequest(user: quickBarCredential.username, password: quickBarCredential.password, otp: quickBarCredential.otp)
    }
  }
}


extension CredentialProviderController: LoginListControllerDelegate {
  
  var uri: String {
    return self.dataModel.URI
  }
  
  func loginSelected(data: AutofillData) {
    AutofillHelpers.ReplaceCredentialIdentities(identifier: self.serviceIdentifier, type: 1, user: data.username, recordIdentifier: data.id)
  
    completeRequest(user: data.username, password: data.password, otp: data.otp)
  }
}
