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
            serviceURL: URL(string: "https://api.cystack.org/locker_scam_detector/v1/pir_service")!,
            tokenIssuerURL: URL(string: "https://api.cystack.org/locker_scam_detector/v1/pir_service")!,
            userTierToken: Data(base64Encoded: "BBBB")!
        )
    }
}
