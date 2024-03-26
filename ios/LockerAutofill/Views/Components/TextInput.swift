import SwiftUI

enum FocusedField {
  case name, username, password, url
}


struct TextInput: View {
  var isPassword: Bool = false
  var titleKey: String
  var textField: FocusedField
  @FocusState var focusedField: FocusedField?
  
  @Binding  var value: String
  @State private var isSecure: Bool = false

  
  var body: some View {
    HStack {
      Group{
        if isSecure{
          SecureField(titleKey, text: $value)
          
        }else{
          TextField(titleKey, text: $value)
        }
      }
      .focused($focusedField, equals: textField)
      .textInputAutocapitalization(.never)
      .disableAutocorrection(true)
      
      if isPassword {
        Button(action: {
          isSecure.toggle()
        }, label: {
          Image(systemName: !isSecure ? "eye.slash" : "eye" )
            .resizable()
            .foregroundStyle(.gray)
            .scaledToFit()
            .frame(width: 24, height: 20)
        })
      }
    }
    .onAppear {
      if (isPassword) {
        isSecure = true
      }
    }
    .padding(12)
    .overlay(
      RoundedRectangle(cornerRadius: 8)
        .stroke(Color(focusedField == textField ? "primary" : "border"), lineWidth: 1)
    )
    .padding(.top, 16)
    
  }
}
