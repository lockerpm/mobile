#import "AppDelegate.h"

#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

// ssl PINNING
#import "RNCConfig.h"
#import <TrustKit/TrustKit.h>
// react-native-fbsdk-next
#import <AuthenticationServices/AuthenticationServices.h>
#import <SafariServices/SafariServices.h>
#import <FBSDKCoreKit/FBSDKCoreKit-swift.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";
  
  [FIRApp configure];

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

//// Linking API
//- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
//  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
//}

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
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [FIRMessaging messaging].APNSToken = deviceToken;
  return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
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
    // Load image
    UIImage *logoImage = [UIImage imageNamed:@"SplashScreenLogo.png"];
    if (!logoImage) {
        NSLog(@"[DEBUG] Image not found!");
        return;
    }

    // Create image view with 250x250 and center it
    UIImageView *imageView = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, 200, 200)];
    imageView.tag = 5678;
    imageView.contentMode = UIViewContentModeScaleAspectFit;
    imageView.image = logoImage;
    imageView.alpha = 1.0;

    // Center it in the window
    imageView.center = CGPointMake(CGRectGetMidX(self.window.bounds), CGRectGetMidY(self.window.bounds));

    // Optional: white background overlay
    UIView *overlay = [[UIView alloc] initWithFrame:self.window.bounds];
    if (@available(iOS 13.0, *)) {
        UIUserInterfaceStyle style = self.window.traitCollection.userInterfaceStyle;
        if (style == UIUserInterfaceStyleDark) {
            overlay.backgroundColor = [UIColor blackColor];
        } else {
            overlay.backgroundColor = [UIColor whiteColor];
        }
      }
    overlay.alpha = 0;
    overlay.tag = 1234;
    [overlay addSubview:imageView];

    [self.window addSubview:overlay];
    [self.window bringSubviewToFront:overlay];

    // Animate fade in
    [UIView animateWithDuration:0.5 animations:^{
        overlay.alpha = 1.0;
    }];
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    UIView *overlay = [self.window viewWithTag:1234];
    if (overlay) {
        [overlay removeFromSuperview];
    }
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
