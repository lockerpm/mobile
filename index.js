// This is the first file that ReactNative will run when it starts up.
//
// We jump out of here immediately and into our main entry point instead.
//
// It is possible to have React Native load our main module first, but we'd have to
// change that in both AppDelegate.m and MainApplication.java.  This would have the
// side effect of breaking other tooling like mobile-center and react-native-rename.
//
// It's easier just to leave it here.
import './shim.js'
import App from "./app/app.tsx"
import { AppRegistry } from "react-native"
import { PushNotifier } from './app/utils/push-notification'

PushNotifier.setupBackgroundHandler()

// Init Flurry once as early as possible recommended in index.js.
// For each platform (Android, iOS) where the app runs you need to acquire a unique Flurry API Key.
// i.e., you need two API keys if you are going to release the app on both Android and iOS platforms.
// If you are building for TV platforms, you will need two API keys for Android TV and tvOS.


AppRegistry.registerComponent("CyStackLocker", () => App)
export default App
