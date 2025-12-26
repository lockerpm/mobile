//
//  TodoViewModel.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 15/08/2024.
//

import Foundation
import Combine

let PAGE_SIZE = 10
let FREE_LIMIT = 5

@MainActor
class PrivateEmailModel: ObservableObject {
    @Published var relays: [RelayAddress] = []
    @Published var totalCount = 0
    @Published var errorMessage = ""
    @Published var hasError = false
  

  func fetchRelayListAddresses(token: String) async {
      let pageNumber =  relays.count / PAGE_SIZE + 1
      guard let data = try?  await PrivateEmailApiService().fetchRelayListAddresses(token: token, page: pageNumber) else {
              self.relays = []
              self.hasError = true
              self.errorMessage  = "Server Error"
              return
          }
        self.totalCount = data.count
        self.relays = self.relays + data.results
    }
  
    func generateRelayNewAddress(token: String) async -> String {
      guard let data = try?  await  PrivateEmailApiService().generateRelayNewAddress(token: token) else {
            return ""
      }
      return data.full_address
    }
  }
