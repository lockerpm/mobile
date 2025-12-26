//
//  LockerLiveCallerLookup.swift
//  LockerLiveCallerLookup
//
//  Created by Nguyen Thinh on 4/11/25.
//

import ExtensionFoundation
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
