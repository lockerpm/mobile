//
//  CredentialProviderController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 21/01/2022.
//

import UIKit
import LocalAuthentication
import AuthenticationServices

protocol CredentialProviderDelegate {
  func cancel()
  func loginSelected(data: AutofillData)
  func isFaceIdEnable() -> Bool
  func authenSuccess()
  func quickBarAuthenSuccess()
}

class CredentialProviderController: ASCredentialProviderViewController {
  private var dataModel: AutofillDataModel = AutofillDataModel()
  private var serviceIdentifier: String!
  private var quickBar: Bool = false
  private var quickBarCredential: AutofillData!
  
  
  @IBOutlet weak var logo: UIImageView!
  private func initController(serviceIdentifier: String, quickBarAccess: Bool = false) {
    
   
    
    self.quickBar = quickBarAccess
    self.dataModel.fetchAutofillDataForUriKeychain(uri: serviceIdentifier)
  
    
    if (!self.dataModel.isLoginLocker()){
      Utils.Noti(contex: self, title: "Authentication", message:  "You must to login Locker befor using autofill service", completion: cancel)
      Utils.RemoveAllCredentialIdentities() // remove all credentials in store
      return
    }

  }
  override func viewDidLoad() {
    if (Utils.LightTheme(self)) {
       logo.isHighlighted = false
    } else {
      logo.isHighlighted = true
    }
  }
  
  override func viewDidAppear(_ animated: Bool) {
      if (self.dataModel.isFaceIdEnabled()){
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
    self.serviceIdentifier = serviceIdentifiers.count > 0 ? serviceIdentifiers[0].identifier : ""
    initController(serviceIdentifier: self.serviceIdentifier)
  }
  
  override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
    self.serviceIdentifier = credentialIdentity.serviceIdentifier.identifier
    initController(serviceIdentifier: self.serviceIdentifier, quickBarAccess: true)
    
    if let credential = self.dataModel.getAutofillDataById(id: credentialIdentity.recordIdentifier!)  {
      self.quickBarCredential = credential
    } else {
      Utils.RemoveCredentialIdentities(credentialIdentity)
    }
  }
  
  override func provideCredentialWithoutUserInteraction(for credentialIdentity: ASPasswordCredentialIdentity) {
    // require for user authen tication
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code:ASExtensionError.userInteractionRequired.rawValue))
  }
  
  private func completeRequest(user: String, password: String){
    let passwordCredential = ASPasswordCredential(user: user, password: password)
    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
  }

  private func performVerifyPasswordScreen(){
    let verifyMasterPasswordScreen = storyboard?.instantiateViewController(withIdentifier: "verifyMasterPasswordScreen") as! VerifyMasterPasswordViewController
    verifyMasterPasswordScreen.credentialProviderDelegate = self
    verifyMasterPasswordScreen.userEmail = self.dataModel.getUserEmail()
    verifyMasterPasswordScreen.hassMasterPass = self.dataModel.getUserHashMasterPass()
    verifyMasterPasswordScreen.authenQuickBar = self.quickBar
    present(verifyMasterPasswordScreen, animated: true, completion: nil)
  }
  
  private func performLoginListScreen(){
    let loginListScreen = storyboard?.instantiateViewController(withIdentifier: "loginListViewController") as! LoginListViewController
    loginListScreen.credentialProviderDelegate = self
    loginListScreen.credentials = self.dataModel.getCredentials()
    loginListScreen.others = self.dataModel.getOtherCredentials()
    loginListScreen.uri = self.dataModel.getUri()
    
    present(loginListScreen, animated: true, completion: nil)
  }
}


extension CredentialProviderController: CredentialProviderDelegate{
  func cancel() {
    self.extensionContext.cancelRequest(withError: NSError(domain: ASExtensionErrorDomain, code: ASExtensionError.userCanceled.rawValue))
  }
  
  func loginSelected(data: AutofillData) {
    Utils.ReplaceCredentialIdentities(identifier: self.serviceIdentifier, type: 1, user: data.username, recordIdentifier: data.id)
    completeRequest(user: data.username, password: data.password)
  }
  
  func isFaceIdEnable() -> Bool {
    return self.dataModel.isFaceIdEnabled()
  }
  
  func authenSuccess() {
    performLoginListScreen()
  }
  
  func quickBarAuthenSuccess() {
    if (self.quickBarCredential == nil) {
      performLoginListScreen()
    } else {
      completeRequest(user: quickBarCredential.username, password: quickBarCredential.password)
    }

  }
}
