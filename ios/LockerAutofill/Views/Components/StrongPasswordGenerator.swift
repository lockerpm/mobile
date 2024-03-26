//
//  StrongPasswordGenerate.swift
//  CipherInput
//
//  Created by Nguyen Thinh on 21/03/2024.
//

import SwiftUI

let generator = PasswordGenerator()

struct PasswordOption: View {
    var label: String
    @Binding var checkBox: Bool
    var onChange: () -> Void
    var body: some View {
        HStack {
            Image(systemName: checkBox ? "checkmark.square.fill" : "square")
                .resizable()
                .scaledToFit()
                .frame(width: 24, height: 24)
                .foregroundColor(Color("primary"))
                .onTapGesture {
                    self.checkBox.toggle()
                    onChange()
                }
            Text(label)
                .padding(.leading, 4)
        }
    }
}

struct StrongPasswordGenerator: View {
    var usePassword: (_ pw: String) -> Void
    @State private var password: String = ""
    @State private var length = 16.0
    @State private var ambiguous = false
    @State private var number = true
    @State private var uppercase = true
    @State private var lowercase = true
    @State private var special = true
    
    var body: some View {
        VStack {
            Text(i.translate("pw.generator"))
              .font(.title3)
            HStack{
                Text(password)
                    .font(.system(size: 20))
                Spacer()
                Button {
                    UIPasteboard.general.string = password
                } label: {
                    Image(systemName: "doc.on.doc")
                        .foregroundColor(.secondary)
                }
              
            }
            .padding()
            .background(Color(uiColor: .secondarySystemGroupedBackground))
            .cornerRadius(15)
            
            
            VStack (alignment: .leading){
                HStack {
                    Text(i.translate("pw.length") + "\(Int(length))")
                        .multilineTextAlignment(/*@START_MENU_TOKEN@*/.leading/*@END_MENU_TOKEN@*/)
                    Slider(
                        value: $length,
                        in: 8...64,
                        step: 1
                    )
                    .onChange(of: length) { newValue in
                        generatePassword()
                        //                    print(newValue)
                    }
                    .tint(Color("primary"))
                }
                
                HStack {
                    PasswordOption(label: "(A-Z)", checkBox: $uppercase) {
                        generatePassword()
                    }
                    Spacer()
                    PasswordOption(label: "(a-z)", checkBox: $lowercase) {
                        generatePassword()
                    }
                    Spacer()
                    PasswordOption(label: "(0-9)", checkBox: $number){
                        generatePassword()
                    }
                }
                PasswordOption(label: i.translate("pw.special"), checkBox: $special){
                    generatePassword()
                }
                PasswordOption(label: i.translate("pw.ambiguous"), checkBox: $ambiguous){
                    generatePassword()
                }
            }
            .padding()
            .background(Color(uiColor: .secondarySystemGroupedBackground))
            .cornerRadius(15)
            
            Spacer()
            Button {
              usePassword(password)
            } label: {
              Text(i.translate("pw.useBtn"))
                .frame(maxWidth: .infinity)
                .foregroundStyle(.white)
            }
            .padding(.vertical, 10)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color("primary")))
            .opacity(password.isEmpty ? 0.5 : 1)
        }
        .padding()
        .background()
        .onAppear {
            generatePassword()
        }
    }
    
    func generatePassword() {
        password = generator.generatePassword(
            length: Int(length),
            ambiguous: ambiguous,
            number: number,
            uppercase: uppercase,
            lowercase: lowercase,
            special: special
        )
    }
}
