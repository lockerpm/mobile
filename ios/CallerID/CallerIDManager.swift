//
//  CallerIDManager.swift
//  Locker
//
//  Created by Nguyen Thinh on 6/5/25.
//

import Foundation
import CallKit

@objc(CallerIDManager)
class CallerIDManager: NSObject {
  @objc
  func getSharedContainerPath(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if let url = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: "group.com.cystack.lockerapp") {
      resolve(url.path)
    } else {
      let error = CallerIDError.noContainer
      reject(error.code, error.description, nil)
    }
  }
  
  @objc
  func reloadCallDirectory(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let manager = CXCallDirectoryManager.sharedInstance
    
    guard let appBundleId = Bundle.main.bundleIdentifier else {
      let error = CallerIDError.bundleError
      reject(error.code, error.description, nil)
      return
    }
    
    // Auto-generate the extension ID
    let extensionId = "\(appBundleId).CallerIDExtension"  // ⚠️ Update if your extension has a different name
    
    // Check if extension is enabled
    manager.getEnabledStatusForExtension(withIdentifier: extensionId) { status, error in
      if let error = error {
        let callerError = CallerIDError.extensionError
        reject(callerError.code, callerError.description, error)
        return
      }
      
      switch status {
      case .enabled:
        manager.reloadExtension(withIdentifier: extensionId) { reloadError in
          if let reloadError = reloadError {
            let callerError = CallerIDError.reloadExtensionError
            reject(callerError.code, callerError.description, reloadError)
          } else {
            resolve(true)
          }
        }
      case .disabled:
        let callerError = CallerIDError.extensionDisable
        reject(callerError.code, callerError.description, nil)
      case .unknown:
        let callerError = CallerIDError.extensionUnknow
        reject(callerError.code, callerError.description, nil)
      @unknown default:
        let callerError = CallerIDError.extensionUnknow
        reject(callerError.code, callerError.description, nil)
      }
    }
  }
  
  @objc
  func getExtensionStatus(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
    let manager = CXCallDirectoryManager.sharedInstance
    
    guard let appBundleId = Bundle.main.bundleIdentifier else {
      let callerError = CallerIDError.extensionError
      reject(callerError.code, callerError.description, nil)
      return
    }
    
    // Auto-generate the extension ID
    let extensionId = "\(appBundleId).CallerIDExtension"
    
    
    manager.getEnabledStatusForExtension(withIdentifier: extensionId) { status, error in
      if let error = error {
        let callerError = CallerIDError.extensionError
        reject(callerError.code, callerError.description, error)
        return
      }
      
      switch status {
      case .enabled:
        resolve("ENABLED")
      case .disabled:
        resolve("DISABLED")
      case .unknown:
        resolve("UNKNOWN")
      @unknown default:
        resolve("UNKNOWN")
      }
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
