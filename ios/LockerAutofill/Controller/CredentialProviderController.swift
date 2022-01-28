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
    performVerifyPasswordScreen()
//      if (self.dataModel.isFaceIdEnabled()){
//        Utils.BiometricAuthentication(
//          view: self,
//          onSuccess: quickBar ? quickBarAuthenSuccess : performLoginListScreen,
//          onFailed: performVerifyPasswordScreen
//        )
//      }
//      else {
//        performVerifyPasswordScreen()
//      }
  }
  
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    print(serviceIdentifiers.count)
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
  

  override func prepare(for segue: UIStoryboardSegue, sender: Any?)
  {
      if segue.identifier == "loginListSegue"
      {
        let loginListView = (segue.destination as! UINavigationController).topViewController as! LoginListViewController
        loginListView.credentialProviderDelegate = self
        loginListView.credentials = self.dataModel.getCredentials()
        loginListView.others = self.dataModel.getOtherCredentials()
        loginListView.uri = self.dataModel.getUri()
      } else if segue.identifier == "verifyMasterPasswordSegue" {
        let verifyMasterPasswordScreen = segue.destination as! VerifyMasterPasswordViewController
        verifyMasterPasswordScreen.credentialProviderDelegate = self
        verifyMasterPasswordScreen.userEmail = self.dataModel.getUserEmail()
        verifyMasterPasswordScreen.hassMasterPass = self.dataModel.getUserHashMasterPass()
        verifyMasterPasswordScreen.authenQuickBar = self.quickBar
      }
  }
  private func performVerifyPasswordScreen(){
    self.performSegue(withIdentifier: "verifyMasterPasswordSegue", sender: self)
  }
  
  private func performLoginListScreen(){
      self.performSegue(withIdentifier: "loginListSegue", sender: self)
  }
  
  private func completeRequest(user: String, password: String){
    let passwordCredential = ASPasswordCredential(user: user, password: password)
    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
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
