import Foundation


class User {
  var URI: String = ""
  var info: UserInfo!
  var afPasswords: [AFPasswordItem] = []
  
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
  
  func getLogins() {
    var passwords: [PasswordItem] = model.getPasswords()
    if !passwords.isEmpty {
      for (index, item) in passwords.enumerated() {
        let credential = AFPasswordItem(fillID: index,
                                        login: item )
        self.afPasswords.append(credential)
      }
    }
    
    var tempPasswords: [TempPasswordItem] = model.getTempPasswords()
    let currentPwLength = self.afPasswords.count
    for (index, item) in tempPasswords.enumerated() {
      let credential = AFPasswordItem(fillID: currentPwLength + index,
                                      id: currentPwLength + index,
                                      tmp: item)
      self.afPasswords.append(credential)
    }
  }
  
  
  func saveTempPassword(_ tempItem: TempPasswordItem) {
    let currentPwLength = self.afPasswords.count
    let credential = AFPasswordItem(fillID: currentPwLength,
                                    id: currentPwLength,
                                    tmp: tempItem)
    self.afPasswords.append(credential)
    self.model.saveTempPassword(tempItem)
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
}
