import Foundation


protocol AutofillScreenDelegate {
  var action: CredentialActions { get }
  var quickBarCredential: AFPasswordItem! { get }
  var user: User { get }
  
  func unlockSuccess()
  func cancel()

  // passkey
  func passkeySelected(data: AFPasskeyItem)
  
  // Generated strong password
  func passwordSelected(password: String)
  func passwordSelected(data: AFPasswordItem)
  func createPasswordItem(item: TempPasswordItem)
}
