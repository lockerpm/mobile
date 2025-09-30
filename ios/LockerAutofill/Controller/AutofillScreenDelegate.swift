import Foundation


protocol AutofillScreenDelegate {
  var action: CredentialActions { get }
  var quickBarCredential: AFPasswordItem! { get }
  var user: User { get }
  
  func unlockSuccess()
  func cancel()
  func passwordSelected(data: AFPasswordItem)
  // Generated strong password
  func passwordSelected(password: String)
  func createPasswordItem(item: TempPasswordItem)
}
