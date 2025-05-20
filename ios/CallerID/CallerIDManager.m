//
//  CallerIDManager.m
//  Locker
//
//  Created by Nguyen Thinh on 6/5/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CallerIDManager, NSObject)

RCT_EXTERN_METHOD(
  reloadCallDirectory:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(getSharedContainerPath:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(getExtensionStatus:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(openSetting:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)


@end
