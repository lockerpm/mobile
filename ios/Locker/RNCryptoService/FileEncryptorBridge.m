//
//  FileEncryptorBridge.swift
//  Locker
//
//  Created by Nguyen Thinh on 17/6/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(FileEncryptor, NSObject)

RCT_EXTERN_METHOD(encryptFileByChunk:(NSString *)inputPath
                  outputPath:(NSString *)outputPath
                  keyBase64:(NSString *)keyBase64
                  chunkSize:(nonnull NSNumber *)chunkSize
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(decryptFileByChunk:(NSString *)inputPath
                  outputPath:(NSString *)outputPath
                  keyBase64:(NSString *)keyBase64
                  chunkSize:(nonnull NSNumber *)chunkSize
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)


@end
