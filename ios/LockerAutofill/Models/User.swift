import Foundation

enum AutofillMode {
  case password
  case passkey
  case passwordVsPasskey
  case otp
  case text
}

class User {
  var URI: String = ""
  var info: UserInfo!
  var filleMode: AutofillMode = .password
  var afPasswords: [AFPasswordItem] = []
  var afPasskeys: [AFPasskeyItem] = []
  
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
  
  func saveTempPasskey(_ tempItem: TempPasskeyItem) {
    let currentPkLength = self.afPasskeys.count
    let credential = AFPasskeyItem(fillID: currentPkLength,
                                    key: tempItem)
    self.afPasskeys.append(credential)
    self.model.saveTempPasskey(tempItem)
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
  
  func getData(mode: AutofillMode) {
    self.filleMode = mode
    switch mode {
    case .password:
      getPasswords()
    case .passkey:
      getPasskeys()
    case .passwordVsPasskey:
      print("Two")
    case .otp:
      print("Three")
    case .text:
      print("Three")
    }
  }
  
  private func getPasskeys() {
    if (self.afPasskeys.isEmpty) {
      let passkeys: [TempPasskeyItem] = model.getPasskeys()
      if !passkeys.isEmpty {
        for (index, item) in passkeys.enumerated() {
          let credential = AFPasskeyItem(fillID: index,
                                          key: item )
          self.afPasskeys.append(credential)
        }
      }
      
      let tempPasskeys: [TempPasskeyItem] = model.getTempPasskeys()
      let currentPkLength = self.afPasskeys.count
      for (index, item) in tempPasskeys.enumerated() {
        let credential = AFPasskeyItem(fillID: currentPkLength + index,
                                       key: item)
        self.afPasskeys.append(credential)
      }
      
      print("afPasskeys", afPasskeys.count)
    }
  }
  
  private func getPasswords() {
    if (self.afPasswords.isEmpty) {
      let passwords: [PasswordItem] = model.getPasswords()
      if !passwords.isEmpty {
        for (index, item) in passwords.enumerated() {
          let credential = AFPasswordItem(fillID: index,
                                          login: item )
          self.afPasswords.append(credential)
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
}
