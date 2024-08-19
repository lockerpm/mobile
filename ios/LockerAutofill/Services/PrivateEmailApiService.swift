//
//  File.swift
//  LockerAutofill
//
//  Created by Nguyen Thinh on 15/08/2024.
//

import Foundation

struct RelayAddress: Identifiable, Codable {
  let id: Int
  let address: String
  let created_time: Float
  let description: String
  let domain: String!
  let enabled: Bool
  let full_address: String
  let num_blocked: Int
  let num_forwarded: Int
  let num_replied: Int
  let num_spam: Int
  let updated_time: Float!
  let subdomain: String!
  let block_spam: Bool
}

struct FetchRelayListResult: Codable {
  let count: Int
  let next: String!
  let previous: String!
  let results: [RelayAddress]
}


enum APIError: Error{
  case invalidUrl, requestError, decodingError, statusNotOk, parametersError
}

let RELAY_URL: String = "https://api.locker.io/v3/cystack_platform/relay/addresses"

struct PrivateEmailApiService {
  func fetchRelayListAddresses(token: String, page: Int) async throws -> FetchRelayListResult {
    var components = URLComponents(string: RELAY_URL)!
    components.queryItems = [
        URLQueryItem(name: "page", value: "\(page)")
    ]
    
    guard let url = components.url else {
      throw APIError.invalidUrl
    }
    
    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.addValue("application/json", forHTTPHeaderField: "Accept")
    request.httpMethod = "GET"

    
    guard let (data, response) = try? await URLSession.shared.data(for: request) else {
      throw APIError.requestError
    }
    
    guard let response = response as? HTTPURLResponse, response.statusCode == 200 else{
      throw APIError.statusNotOk
    }
    guard let result = try? JSONDecoder().decode(FetchRelayListResult.self, from: data) else {
      throw APIError.decodingError
    }
    return result
  }
  
  func generateRelayNewAddress(token: String) async throws -> RelayAddress {
    let components = URLComponents(string: RELAY_URL)!
    guard let url = components.url else{
      throw APIError.invalidUrl
    }
    
    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.addValue("application/json", forHTTPHeaderField: "Accept")
    request.httpMethod = "POST"
    
    
    guard let (data, response) = try? await URLSession.shared.data(for: request) else {
      throw APIError.requestError
    }
    
    guard let response = response as? HTTPURLResponse, response.statusCode == 201 else{
      throw APIError.statusNotOk
    }
    
    guard let result = try? JSONDecoder().decode(RelayAddress.self, from: data) else {
      throw APIError.decodingError
    }

    return result
  }
  
}
