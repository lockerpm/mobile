//
//  RCTCryptoServiceIos.m
//  CyStackLocker
//
//  Created by Nguyen Thinh on 29/03/2022.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNCryptoServiceIos, NSObject)


RCT_EXTERN_METHOD(decryptOAEPSHA1:(NSString *)encryptedB64
                  priKeyB64:(NSString *)priKeyB64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)



@end
