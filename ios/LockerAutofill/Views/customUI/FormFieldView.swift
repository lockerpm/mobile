//
//  FormFieldView.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 28/01/2022.
//



import Foundation
import UIKit

private struct Local {
    static let height: CGFloat = 60
    static let tintColorValid: UIColor = UIColor(
        red: CGFloat(61) / 255.0,
        green: CGFloat(150) / 255.0,
        blue: CGFloat(45) / 255.0,
        alpha: CGFloat(1.0))
    static let backgroundColor: UIColor = .gray
    static let foregroundColor: UIColor = .gray
}

class FormFieldView: UIView {
    var passwordField = false
    let underLineView = UIView()
    let label = UILabel()
    let textField = UITextField()
    let eyeIcon = makeSymbolButton(name: "eye", target: self, selector: #selector(toggle(_:)))
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
        style()
        layout()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
        style()
        layout()
    }
    
    override var intrinsicContentSize: CGSize {
        return CGSize(width: UIView.noIntrinsicMetric, height: Local.height)
    }
   
}

extension FormFieldView {
    
    func setup() {
        textField.delegate = self
    }
    
    func style() {
      translatesAutoresizingMaskIntoConstraints = false
   
      // underline
      underLineView.translatesAutoresizingMaskIntoConstraints = false
      underLineView.backgroundColor = .black
      
      // label
      label.translatesAutoresizingMaskIntoConstraints = false
      label.textColor = .systemGray
      label.font = label.font.withSize(16)

      textField.translatesAutoresizingMaskIntoConstraints = false
      textField.tintColor = Local.tintColorValid
      textField.isHidden = true
      textField.borderStyle = UITextField.BorderStyle.none
      
      // button
      eyeIcon.translatesAutoresizingMaskIntoConstraints = false
      eyeIcon.imageView?.tintColor = Local.foregroundColor
      eyeIcon.isHidden = true
      
      let tap = UITapGestureRecognizer(target: self, action: #selector(tapped(_: )))
      addGestureRecognizer(tap)
    }
    
    func layout() {
        addSubview(label)
        addSubview(textField)
        addSubview(underLineView)
        addSubview(eyeIcon)
        NSLayoutConstraint.activate([
            // textfield
            textField.leadingAnchor.constraint(equalTo: leadingAnchor),
            textField.trailingAnchor.constraint(equalTo: trailingAnchor),
            textField.centerYAnchor.constraint(equalTo: centerYAnchor),
            
            label.centerYAnchor.constraint(equalTo: textField.centerYAnchor),
            label.leadingAnchor.constraint(equalTo: textField.leadingAnchor),
            
            eyeIcon.centerYAnchor.constraint(equalTo: textField.centerYAnchor),
            eyeIcon.trailingAnchor.constraint(equalTo: textField.trailingAnchor),
     
            underLineView.leadingAnchor.constraint(equalTo: textField.leadingAnchor),
            underLineView.trailingAnchor.constraint(equalTo: textField.trailingAnchor),
            underLineView.bottomAnchor.constraint(equalTo: textField.bottomAnchor, constant: 8),
            underLineView.heightAnchor.constraint(equalToConstant: 0.5)

        ])
    }
    
    @objc func tapped(_ recognizer: UITapGestureRecognizer) {
        if(recognizer.state == UIGestureRecognizer.State.ended) {
            enterEmailAnimation()
        }
    }
}


extension FormFieldView {
    func enterEmailAnimation() {

        UIViewPropertyAnimator.runningPropertyAnimator(withDuration: 0.3,
                                                       delay: 0.1,
                                                       options: []) {
            // style
            self.backgroundColor = .white
           
            self.textField.tintColor = Local.tintColorValid
            self.underLineView.backgroundColor = Local.tintColorValid
            // move
            let transpose = CGAffineTransform(translationX: 0, y: -28)
            let scale = CGAffineTransform(scaleX: 1, y: 1)
            self.label.transform = transpose.concatenating(scale)
            
        } completion: { position in
            self.textField.isHidden = false
            self.textField.becomeFirstResponder()
            self.eyeIcon.isHidden = !self.passwordField
        }
    }
}

// MARK: - TextFieldDelegate

extension FormFieldView: UITextFieldDelegate {
    
    func textFieldDidBeginEditing(_ textField: UITextField) {
        select()
    }

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        unSelect()
        return true
    }
    
    func textFieldShouldEndEditing(_ textField: UITextField) -> Bool {
        return true
    }
    
    func textFieldDidEndEditing(_ textField: UITextField) {
       
        if textField.text == "" {
            undo()
        }
        unSelect()
    }
    @objc func toggle(_ sender: UIButton) {
        textField.isSecureTextEntry = !textField.isSecureTextEntry
      
//        let mediumConfig = UIImage.SymbolConfiguration(pointSize: 15, weight: .light, scale: .medium)
        if textField.isSecureTextEntry {
          eyeIcon.setImage(UIImage(named: "eye"), for: .normal)
        } else {
          eyeIcon.setImage(UIImage(named: "eye-slash"), for: .normal)
        }
//      eyeIcon.image
    }
}


// MARK: - Actions

extension FormFieldView {
    
    func setLabel(label: String, passwordField: Bool){
      self.passwordField = passwordField
      self.textField.isSecureTextEntry = passwordField
      self.label.text = label
      self.eyeIcon.isHidden = !passwordField
    }
   
    func setText(label: String?, textField: String?, passwordField: Bool) {
      self.textField.isUserInteractionEnabled = false
      self.passwordField = passwordField
      if self.passwordField {
          self.eyeIcon.isHidden = false
          self.textField.isSecureTextEntry = true
      }
      
      self.label.text = label
      self.textField.isHidden = false
      self.textField.text = textField
      let transpose = CGAffineTransform(translationX: 0, y: -28)
      let scale = CGAffineTransform(scaleX: 1, y: 1)
      self.label.transform = transpose.concatenating(scale)
    }
    
    func undo() {
        let size = UIViewPropertyAnimator(duration: 0.2, curve: .linear) {
            // style
            // visibility
            self.underLineView.backgroundColor = .black
            self.label.isHidden = false
            self.textField.isHidden = true
            self.textField.text = ""
            self.eyeIcon.isHidden = true
            // move
            self.label.transform = .identity
        }
        size.startAnimation()
    }
    
    func unSelect() {
        self.underLineView.backgroundColor = .black
    }
    
    func select() {
        self.underLineView.backgroundColor = Local.tintColorValid
    }
}


// MARK: - Factories

func makeSymbolButton(name: String, target: Any, selector: Selector) -> UIButton {
    
    let image = UIImage(named: name)
    
    let button = UIButton()
    button.translatesAutoresizingMaskIntoConstraints = false
    button.addTarget(target, action: selector, for: .primaryActionTriggered)
    button.setImage(image, for: .normal)
    button.imageView?.contentMode = .scaleAspectFit
    
    return button
}
