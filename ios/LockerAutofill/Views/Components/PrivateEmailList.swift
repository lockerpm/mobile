//
//  EmailList.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 14/08/2024.
//

import SwiftUI



struct PrivateEmailList: View {
  @StateObject var data = PrivateEmailModel()
  var token: String
  var useEmail: (_ email: String) -> Void
  
  
  var content: some View {
    VStack {
      Text(i.translate("relay.existing_email"))
        .font(.title3)
        .padding()
        .padding(.bottom, -4)
      List {
        ForEach(data.relays){relay in
          Button {
            useEmail(relay.full_address)
          } label: {
            Text("\(relay.full_address)")
              .padding(.vertical, 8)
          }
        }
        if data.relays.count < data.totalCount && !data.hasError {
          ProgressView()
            .task {
              await data.fetchRelayListAddresses(token: token)
            }
        }
      }
      .onAppear(perform: {
        UICollectionView.appearance().contentInset.top = -23
      })
      .task {
        await data.fetchRelayListAddresses(token: token)
      }
      .onDisappear{
        UICollectionView.appearance().contentInset.top = 8
      }
    }
  }
  
  var body: some View {
    if #available(iOS 16.0, *) {
      return content.scrollIndicators(.hidden)
    } else {
      return content
    }
  }
}

