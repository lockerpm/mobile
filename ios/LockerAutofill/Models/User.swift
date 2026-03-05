import Foundation


class User {
  var URI: String = ""
  var info: UserInfo!
  var mode: CredentialActions = .fillPassword
  var afPasswords: [AFPasswordItem] = []
  var afPasskeys: [PasskeyItem] = []
  var afOTPs: [OTPItem] = []
  
  // support passkey
  var allowedCredentialIDs: [String] = []
  var rpID: String = ""
  var newPasskeyUsername: String = ""
  var newPasskeyRpID: String = ""
  
  private var model = AutofillDataModelProtobuf()
  
  var loginedLocker: Bool {
    get {
      return info != nil
    }
  }
  
  var faceIdEnabled: Bool {
    get {
      return info?.faceIdEnabled ?? false
    }
  }
  
  // try to fetch user info when initilize
  init() {
    self.info = self.model.getUserInfo()
  }
  
  func setUri(uri: String, isDomain: Bool) {
    self.URI = uri
  }
  
  func saveTempPassword(_ tempItem: TempPasswordItem) {
    let currentPwLength = self.afPasswords.count
    let credential = AFPasswordItem(fillID: currentPwLength,
                                    id: currentPwLength,
                                    tmp: tempItem)
    self.afPasswords.append(credential)

    self.model.saveTempPassword(tempItem)
    
  }
  
  func saveTempPasskey(_ item: PasskeyItem) {
    self.afPasskeys.append(item)

    self.model.saveTempPasskey(item)
    
  }
  
  func getPasswordItemById(id: String?) -> AFPasswordItem? {
    getData(mode: .quickBarPassword)
    if id == nil {
      return nil
    }
    if let item = self.afPasswords.first(where: {$0.login.id == id}){
      return item
    }
    return nil
  }
  
  func getOTPItemById(id: String?) -> OTPItem? {
    getData(mode: .quickBarOTP)
    if id == nil {
      return nil
    }
    if let item = self.afOTPs.first(where: {$0.id == id}){
      return item
    }
    return nil
  }
  
  func getPasskeyItemById(userName: String, rpId: String) -> PasskeyItem? {
    getData(mode: .quickBarPasskey)
    if let item = self.afPasskeys.first(where: {
      $0.userName == userName && $0.rpId == rpId
    }){
      return item
    }
    return nil
  }
  
  func getData(mode: CredentialActions) {
    self.mode = mode
    switch mode {
    case .fillText:
      getFillText()
    case .fillOtp, .quickBarOTP:
      getOTPs()
    case .fillPasskey, .createPasskey, .quickBarPasskey:
      getPasswordsAndPasskeys()
    default:
      getPasswords()
    }
  }
  
  private func getFillText() {
    getOTPs()
    getPasswords()
  }
  
  private func getPasswordsAndPasskeys() {
    getPasswords()
    
    let currentPwLength = self.afPasswords.count
    let passkeys: [PasskeyItem] =  model.getTempPasskeys()
    self.afPasskeys += passkeys
    
    for (index, item) in passkeys.enumerated() {
      let credential = AFPasswordItem(fillID: currentPwLength + index,
                                      id: currentPwLength + index,
                                      tmp: item)
      self.afPasswords.append(credential)
    }

  }
  
  private func getPasswords() {
    let passwords: [PasswordItem] = model.getPasswords()
    for (index, item) in passwords.enumerated() {
      let credential = AFPasswordItem(fillID: index,
                                      login: item )
      self.afPasswords.append(credential)
      if (credential.login.fido2?.count ?? 0 > 0) {
        self.afPasskeys += credential.login.fido2
      }
    }

    
    let tempPasswords: [TempPasswordItem] = model.getTempPasswords()
    let currentPwLength = self.afPasswords.count
    for (index, item) in tempPasswords.enumerated() {
      let credential = AFPasswordItem(fillID: currentPwLength + index,
                                      id: currentPwLength + index,
                                      tmp: item)
      self.afPasswords.append(credential)
    }
  }
  
  private func getOTPs() {
    self.afOTPs = model.getOTPs()
  }
}
