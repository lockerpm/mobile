#import <Firebase.h>
#import "AppDelegate.h"
#import "RNCConfig.h"
#import "RNBootSplash.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

#import <IntercomModule.h>

#import <TrustKit/TrustKit.h>

// react-native-fbsdk-next
#import <AuthenticationServices/AuthenticationServices.h>
#import <SafariServices/SafariServices.h>
#import <FBSDKCoreKit/FBSDKCoreKit-swift.h>


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

  
  self.moduleName = @"Locker";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  [super application:application didFinishLaunchingWithOptions:launchOptions];

  // RN BootSplash
  UIView *rootView = self.window.rootViewController.view; // react-native >= 0.71 specific
  [RNBootSplash initWithStoryboard:@"LaunchScreen" rootView:rootView];

  [FIRApp configure];

  [IntercomModule initialize:@"ios_sdk-b3558c685a17ec60d659f373a4cbb6ca9c39e167" withAppId:@"hjus3ol6"];
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  return true;
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  
  if ([[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
    return YES;
  }

  if ([RCTLinkingManager application:application openURL:url options:options]) {
    return YES;
  }
  
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}



// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  return [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

// ------------ Prevent preview background
- (void)applicationWillResignActive:(UIApplication *)application
{
    UIImageView *imageView = [[UIImageView alloc] initWithFrame:self.window.bounds];
    imageView.tag = 1234;
    imageView.backgroundColor = [UIColor whiteColor];
    imageView.contentMode = UIViewContentModeScaleAspectFill;
    [imageView setImage:[UIImage imageNamed:@"LaunchScreen.png"]];
    [self.window addSubview:imageView];
    [self.window bringSubviewToFront:imageView];
    // fade in the view
    [UIImageView animateWithDuration:0.5 animations:^{
      imageView.alpha = 1;
    }];
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    // grab a reference to our coloured view
    UIView *colourView = [self.window viewWithTag:1234];
    // fade away colour view from main view
    [UIView animateWithDuration:0.5 animations:^{
        colourView.alpha = 0;
    } completion:^(BOOL finished) {
        // remove when finished fading
        [colourView removeFromSuperview];
    }];
}

- (void)initTrustKit {
     NSDictionary *trustKitConfig =
     @{
       kTSKSwizzleNetworkDelegates: @NO,
       kTSKPinnedDomains : @{
         [RNCConfig envFor:@"SSL_PINNING_HOST"] : @{
              kTSKEnforcePinning : @YES,
              kTSKIncludeSubdomains:@YES,
              kTSKPublicKeyHashes : @[
                  [RNCConfig envFor:@"SSL_PINNING_PUB_KEY_1"],
                  [RNCConfig envFor:@"SSL_PINNING_PUB_KEY_2"]
              ]
         },
       }
     };
    [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];
}


@end
