//
//  CredentialProviderController.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 21/01/2022.
//


import AuthenticationServices


protocol CredentialProviderDelegate {
  func cancel()
  func loginSelected(user: String, password: String)
  func isFaceIdEnable() -> Bool
  func authenSuccess()
}

class CredentialProviderController: ASCredentialProviderViewController {
  private var lock: Bool = true;
  private var dataModel: AutofillDataModel = AutofillDataModel()
  
    
  override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
    
    let uri = Utils.GetCipherUri(for: serviceIdentifiers)
    
    self.dataModel.fetchAutofillDataForUriKeychain(uri: uri)
    
    
    if (!self.dataModel.isLoginLocker()){
      Utils.Noti(contex: self, title: "Authentication", message:  "You must to login Locker befor using autofill service", completion: cancel)
      return
    }
    
    if (self.dataModel.isFaceIdEnabled()){
      lock = false
      Utils.BiometricAuthentication(contex: self, authenSuccess: performLoginListScreen)
    }
    
    if (lock) {
      performVerifyPasswordScreen()
    }
  }
  
  override func provideCredentialWithoutUserInteraction(for credentialIdentity: ASPasswordCredentialIdentity) {

      let passwordCredential = ASPasswordCredential(user: "j_appleseed", password: "apple1234")
      self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)

  }
  
  private func performVerifyPasswordScreen(){
    let verifyMasterPasswordScreen = storyboard?.instantiateViewController(withIdentifier: "verifyMasterPasswordScreen") as! VerifyMasterPasswordViewController
    verifyMasterPasswordScreen.credentialProviderDelegate = self
    verifyMasterPasswordScreen.userEmail = self.dataModel.getUserEmail()
    verifyMasterPasswordScreen.hassMasterPass = self.dataModel.getUserHashMasterPass()
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
  
  func loginSelected(user: String, password: String) {
    let passwordCredential = ASPasswordCredential(user: user, password: password)
    self.extensionContext.completeRequest(withSelectedCredential: passwordCredential, completionHandler: nil)
  }
  
  func isFaceIdEnable() -> Bool {
    return self.dataModel.isFaceIdEnabled()
  }
  
  func authenSuccess() {
    print("authen success")
    performLoginListScreen()
  }
}
