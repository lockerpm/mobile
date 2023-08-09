//
//  CredentialTableViewCell.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 02/12/2021.
//

import UIKit


class CredentialTableViewCell: UITableViewCell {
  var IconbackgroundColor: [UIColor] = [.red, .green, .blue]
  var credentialID : String?
  @IBOutlet weak var editCredential: UIButton!
  @IBOutlet weak var uri: UILabel!
  @IBOutlet weak var username: UILabel!
  override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    //credentialIconLabel.backgroundColor = UIColor(patternImage: UIImage(named: "backgroundImage")!)
    //editCredential.setImage(UIImage(name: "edi", withConfiguration: mediumConfig), for: .normal)
  }
  
  func makeCell(credential: AutofillData){
    self.credentialID = credential.id
    self.username.text = credential.name
    self.uri.text = credential.username ?? credential.uri
  }
}
