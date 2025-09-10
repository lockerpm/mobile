import Foundation
import IdentityLookup
import CallKit

@objc(CallerIDManager)
class CallerIDManager: NSObject {
  @objc
  func isExtensionActived(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // Check the status of your app extension.
    if #available(iOS 18.2, *) {
      if LiveCallerIDLookupManager.shared.status(forExtensionWithIdentifier: "com.cystack.lockerapp.lookup") == .enabled {
        resolve(true)
        return
      }
    }
    // Fallback on earlier versions
    resolve(false)
  }
  
  @objc
  func openSetting(_ resolve: @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) {
      if #available(iOS 18.2, *) {
          Task {
              do {
                  try await LiveCallerIDLookupManager.shared.openSettings()
                  resolve(nil)
              } catch {
                  reject("OPEN_SETTINGS_ERROR", error.localizedDescription, error)
              }
          }
      } else {
          reject("UNSUPPORTED_IOS", "This feature requires iOS 18 or later.", nil)
      }
  }
  
  @objc
  func reset(_ resolve: @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) {
      if #available(iOS 18.2, *) {
          Task {
              do {
                try await LiveCallerIDLookupManager.shared.reset(forExtensionWithIdentifier: "com.cystack.lockerapp.lookup")
                resolve(nil)
              } catch {
                  reject("RESET_EXTENSION_ERROR", error.localizedDescription, error)
              }
          }
      } else {
          reject("UNSUPPORTED_IOS", "This feature requires iOS 18 or later.", nil)
      }
  }
  
  @objc
  func refreshPIRParameters(_ resolve: @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) {
      if #available(iOS 18.2, *) {
          Task {
              do {
                try await LiveCallerIDLookupManager.shared.refreshPIRParameters(forExtensionWithIdentifier: "com.cystack.lockerapp.lookup")
                resolve(nil)
              } catch {
                  reject("REFRESH_EXTENSION_ERROR", error.localizedDescription, error)
              }
          }
      } else {
          reject("UNSUPPORTED_IOS", "This feature requires iOS 18 or later.", nil)
      }
  }
  
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
