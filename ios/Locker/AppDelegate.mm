#import <Firebase.h>
#import "AppDelegate.h"
#import "RNCConfig.h"
#import "RNBootSplash.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

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

  if ([RCTLinkingManager application:application openURL:url options:options]) {
    return YES;
  }
  
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
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

@end
