//
//  File.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 22/02/2024.
//

import Foundation
import UIKit

func noti(contex: UIViewController ,title: String, message: String, completion: (() -> Void)? = nil) -> Void {
  let log = {() -> () in print(message)}
  let alert = UIAlertController(title: i.translate(title), message: i.translate(message), preferredStyle: UIAlertController.Style.alert)
  
  alert.addAction(UIAlertAction(title: "OK", style: .default, handler: { (action: UIAlertAction!) in
    (completion ?? log)()
  }))
  
  contex.present(alert, animated: true, completion:   nil)
}
