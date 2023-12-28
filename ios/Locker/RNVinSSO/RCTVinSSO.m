//
//  RCTVinSSO.m
//  Locker
//
//  Created by Nguyen Thinh on 11/05/2023.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(VinCssSsoLoginModule, NSObject)

RCT_EXTERN_METHOD(startWebauth: (NSString)url
                  callbackDomain:(NSString *)callback
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end
