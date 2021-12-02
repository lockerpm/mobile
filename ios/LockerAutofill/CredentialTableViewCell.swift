//
//  CredentialTableViewCell.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 02/12/2021.
//

import UIKit


class CredentialTableViewCell: UITableViewCell {
  var IconbackgroundColor: [UIColor] = [.red, .green, .blue]
  @IBOutlet weak var credentialIconLabel: UILabel!
  @IBOutlet weak var editCredential: UIButton!
  @IBOutlet weak var uri: UILabel!
  @IBOutlet weak var username: UILabel!
  override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
  func setCredentialIconLabel(text: String) {
    // take first letter
    let s = text.uppercased()
    let index = s.index(s.startIndex, offsetBy: 0)
    self.credentialIconLabel.text = String(s[index])
    self.credentialIconLabel.backgroundColor = .green
    self.credentialIconLabel.tintColor = .white
    
  }
}
