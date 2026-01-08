import Foundation


enum CredentialActions {
  case fillOtp
  case fillText
  case fillPassword
  case fillPasskey
  case quickBarPassword
  case quickBarOTP
  case quickBarPasskey
  case createPasskey
}

protocol AutofillScreenDelegate {
  var user: User { get }
  
  func unlockSuccess()
  func cancel()

  //otp
  func otpSelected(item: OTPItem)
  
  // passkey
  func passkeySelected(data: PasskeyItem)
  func passkeyRegistration(id: String)
  
  // Generated strong password
  func passwordSelected(password: String)
  func passwordSelected(data: AFPasswordItem)
  func createPasswordItem(item: TempPasswordItem)
}
