//
//  MasterPasswordInput.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 26/02/2024.
//

import SwiftUI

struct MasterPasswordInput: View {
    @Binding  var masterPassword: String
    @FocusState private var focusedField: Bool
    @State private var isSecure: Bool = true
    
    var titleKey = "Master password"
    var body: some View {
        HStack {
            Group{
               if isSecure{
                   SecureField(titleKey, text: $masterPassword)
                   
               }else{
                   TextField(titleKey, text: $masterPassword)
                  
               }
            }
            .focused($focusedField)
            .textInputAutocapitalization(.never)
            .disableAutocorrection(true)
            .onAppear {
              focusedField = true
            }
           
            Button(action: {
                isSecure.toggle()
            }, label: {
                Image(systemName: !isSecure ? "eye.slash" : "eye" )
                    .foregroundStyle(.gray)
            })
        }
        .padding(12)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color(focusedField ? "primary" : "border"), lineWidth: 1)
        )
        .padding(.vertical)
        .padding(.top, 16)
        
    }
}
