//
//  CustomTextField.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 02/12/2021.
//

import UIKit

class CustomTextField: UITextField {

   
  func customTextField() {
    let underLineView = UIView()
    underLineView.translatesAutoresizingMaskIntoConstraints = false
    underLineView.backgroundColor = .black
    addSubview(underLineView)
    
    NSLayoutConstraint.activate([
      underLineView.leadingAnchor.constraint(equalTo: leadingAnchor),
      underLineView.trailingAnchor.constraint(equalTo: trailingAnchor),
      underLineView.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -5),
      underLineView.heightAnchor.constraint(equalToConstant: 0.5)
    ])
  }
  
  override func awakeFromNib() {
    super.awakeFromNib()
    customTextField()
  }

}

extension UITextField {
  @IBInspectable var placeHolderColor: UIColor?{
    get {return self.placeHolderColor}
    set {self.attributedPlaceholder = NSAttributedString(string: self.placeholder != nil ? self.placeholder! : "", attributes: [NSAttributedString.Key.foregroundColor : newValue!])}
  }
}
