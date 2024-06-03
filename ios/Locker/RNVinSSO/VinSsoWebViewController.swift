//
//  VinSsoWebViewController.swift
//  Locker
//
//  Created by Nguyen Thinh on 15/05/2023.
//


import UIKit
import AVFoundation
import Foundation
import os
import VinCSSFido2ClientSDK

class VinSsoWebViewController: UIViewController {
  var url:String = ""
  var callbackURIDomain:String = ""
  var resolver: RCTPromiseResolveBlock?
  
  override func viewDidLoad() {
      super.viewDidLoad()
    let fidoClientSdk = Fido2ClientSDK()
    fidoClientSdk.openUrl(viewController: self, url: url, popPreviousNavigationItem: true, fido2ClientDelegate: self, navigateWhenFinished: true, shouldValidatingURL: false, callbackURIDomain: callbackURIDomain)
  }
}

extension VinSsoWebViewController: Fido2ClientViewControllerDelegate{
  func onClientLoadPageFinished(status: Int, type: Int?, errorCode: Int?, errorMessage: String?, callbackUrl: String?, fromVC: UIViewController) {
    // Handle callback result here
//    print("status: \(status) type: \(type) errorCode: \(errorCode) errorMessage: \(errorMessage) callbackURL: \(callbackUrl)")

    self.dismiss(animated: true, completion: nil)
    self.resolver!(callbackUrl)
  }
    
    func onClientClose(_ mFido2ClientViewController: VinCSSFido2ClientSDK.Fido2ClientViewController) {
    }
    
    func onClientProcessLocalHost(withCode: String) {
    }
    
}
