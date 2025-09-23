import Foundation


protocol AutofillScreenDelegate {
  var quickBar: Bool  { get }
  var quickBarCredential: AFPasswordItem! { get }
  var user: User { get }
  
  func cancel()
  func loginSelected(data: AFPasswordItem)
  func passwordSelected(password: String)
  func createLoginItem(item: TempPasswordItem)
}
