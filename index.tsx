import "@expo/metro-runtime"
import "node-libs-react-native/globals"
import "react-native-quick-base64"
import "react-native-get-random-values"
import { registerRootComponent } from "expo"

import App from "@/app"

// install()
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
