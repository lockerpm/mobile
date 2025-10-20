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
            serviceURL: URL(string: "https://pir.locker.io")!,
            tokenIssuerURL: URL(string: "https://pir.locker.io")!,
            userTierToken: Data(base64Encoded: "AAAA")!
        )
    }
}
