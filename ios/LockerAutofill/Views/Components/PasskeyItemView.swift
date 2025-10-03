//
//  PasswordItemView.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 29/02/2024.
//

import SwiftUI

struct PasskeyItemView: View {
  var item: AFPasskeyItem
  var body: some View {
    VStack(alignment: .leading){
      HStack {
        PasswordImage(itemUri: item.key.rpId)
        
        VStack(alignment: .leading){
          Text(item.key.userName)
        }
        Spacer()
      }
    }
  }
}
