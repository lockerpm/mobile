import "react-native-get-random-values"

// It's easier just to leave it here.
import "./shim.js"
import React from "react"
import App from "./app/app.tsx"
import { AppRegistry } from "react-native"
import { PushNotifier } from "./app/utils/pushNotification"

PushNotifier.setupBackgroundHandler()

function IgniteApp(props) {
  return <App {...props} />
}

AppRegistry.registerComponent("Locker", () => IgniteApp)


export default App
