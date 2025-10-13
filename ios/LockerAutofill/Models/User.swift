import Foundation


class User {
  var URI: String = ""
  var info: UserInfo!
  var mode: CredentialActions = .fillPassword
  var afPasswords: [AFPasswordItem] = []
  var afPasskeys: [PasskeyItem] = []
  
  // support passkey
  var allowedCredentialIDs: [String] = []
  var newPasskeyUsername: String = ""
  var newPasskeyRpID: String = ""
  
  private var model = AutofillDataModel()
  
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
  
  func saveTempPasskey(id: String, data: PasskeyItem) {
    let saveItem = PasskeyItem(id: id, data: data)
    self.afPasskeys.append(saveItem)
    self.model.saveTempPasskey(saveItem)
  }
  
  func getPasswordItemById(id: String?) -> AFPasswordItem? {
    if id == nil {
      return nil
    }
    if let item = self.afPasswords.first(where: {$0.login.id == id}){
      return item
    }
    return nil
  }
  
  func getData(mode: CredentialActions) {
    self.mode = mode
    switch mode {
    case .fillText:
      print("fillText")
    case .fillOtp:
      print("fillOtp")
    case .fillPasskey, .createPasskey:
      getPasswordsAndPasskeys()
    default:
      getPasswords()
    }
  }
  
  private func getPasswordsAndPasskeys() {
    getPasswords()
    let passkeys: [PasskeyItem] = model.getTempPasskeys()
    self.afPasskeys += passkeys
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
}
