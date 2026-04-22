//
//  RNCryptoServiceIos.m
//  Locker
//
//  Created by Nguyen Thinh on 17/6/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNCryptoServiceIos, NSObject)


RCT_EXTERN_METHOD(decryptOAEPSHA1:(NSString *)encryptedB64
                  priKeyB64:(NSString *)priKeyB64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(argon2: (NSString *)password salt:(NSString *)salt config:(NSDictionary *)config resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)



@end
