//
//  LiveCallerIDExtension.swift
//  LiveCallerIDExtension
//
//  Created by Nguyen Thinh on 8/5/25.
//

import IdentityLookup

@main
struct LiveCallerIDExtension: LiveCallerIDLookupProtocol {
    var context: LiveCallerIDLookupExtensionContext {
        LiveCallerIDLookupExtensionContext(
            serviceURL: URL(string: "https://service.example.com")!,
            tokenIssuerURL: URL(string: "https://token-issuer.example.com")!,
            userTierToken: Data())
    }
}
