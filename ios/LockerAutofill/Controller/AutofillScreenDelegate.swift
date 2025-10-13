import Foundation


enum CredentialActions {
  case fillOtp
  case fillText
  case fillPassword
  case fillPasskey
  case quickBarPassword
  case quickBarPasskey
  case createPasskey
}

protocol AutofillScreenDelegate {
  var quickBarCredential: AFPasswordItem! { get }
  var user: User { get }
  
  func unlockSuccess()
  func cancel()

  // passkey
  func passkeySelected(data: PasskeyItem)
  func passkeyRegistration(id: String)
  
  // Generated strong password
  func passwordSelected(password: String)
  func passwordSelected(data: AFPasswordItem)
  func createPasswordItem(item: TempPasswordItem)
}
