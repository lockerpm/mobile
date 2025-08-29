//
//  LockerLiveCallerLookup.swift
//  LockerLiveCallerLookup
//
//  Created by Nguyen Thinh on 21/8/25.
//

import IdentityLookup

@main
struct LockerLiveCallerLookup: LiveCallerIDLookupProtocol {
    var context: LiveCallerIDLookupExtensionContext {
        LiveCallerIDLookupExtensionContext(
            serviceURL: URL(string: "http://Nguyens-Mac-mini-3.local:9000")!,
            tokenIssuerURL: URL(string: "http://Nguyens-Mac-mini-3.local:9000")!,
            userTierToken: Data(base64Encoded: "BBBB")!
        )
    }
}
