// This is the first file that ReactNative will run when it starts up.
// Both do essentially the same thing.

import 'react-native-get-random-values'

// It's easier just to leave it here.
import './shim.js'
import React from 'react'
import App from './app/app.tsx'
import { AppRegistry } from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import { PushNotifier } from './app/utils/pushNotification'

PushNotifier.setupBackgroundHandler()

function IgniteApp(props) {
  return <App hideSplashScreen={RNBootSplash.hide} {...props} />
}

AppRegistry.registerComponent('Locker', () => IgniteApp)
export default App
