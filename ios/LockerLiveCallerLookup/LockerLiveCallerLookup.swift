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
            serviceURL: URL(string: "https://api.locker.io/pir")!,
            tokenIssuerURL: URL(string: "https://api.locker.io/pir")!,
            userTierToken: Data(base64Encoded: "AAAA")!
        )
    }
}
