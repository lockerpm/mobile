//
//  RNVinSSO.swift
//  Locker
//
//  Created by Nguyen Thinh on 11/05/2023.
//


import Foundation
import UIKit

@objc(VinCssSsoLoginModule)
class VinCssSsoLoginModule: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool {
      return true
  }
  
  @objc
  func startWebauth(_ url: String,
                  callbackDomain callback: String,
                  resolver resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock
  ) -> Void {
    DispatchQueue.main.async {
      let modelVC = VinSsoWebViewController()
      modelVC.url = url
      modelVC.callbackURIDomain = callback
      modelVC.resolver = resolve
      
      let navController = UINavigationController(rootViewController: modelVC)
      navController.modalPresentationStyle = .fullScreen
//      navController.set
      navController.setNavigationBarHidden(true, animated: true)
      let topController = UIApplication.topMostViewController()
      topController?.present(navController, animated: true, completion: nil)
    }
  }
}
