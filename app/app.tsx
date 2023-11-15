/* eslint-disable import/first */
if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("./devtools/ReactotronConfig.ts")
}
import "./i18n"
import "./utils/ignoreWarnings"
import React, { ComponentType, useRef } from "react"
import { NavigationContainerRef } from "@react-navigation/native"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { useInitialRootStore } from "./models"
import {
  useBackButtonHandler,
  RootNavigator,
  canExit,
  setRootNavigation,
  useNavigationPersistence,
} from "./navigators"
import * as storage from "./utils/storage"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { StyleSheet } from "react-native"
import * as Tracking from "./utils/tracking"
import * as Sentry from "@sentry/react-native"
// This puts screens in a native ViewController or Activity. If you want fully native
// stack navigation, use `createNativeStackNavigator` in place of `createStackNavigator`:
// https://github.com/kmagiera/react-native-screens#using-native-stack-navigator
import { enableScreens } from "react-native-screens"
import { ApiResponse } from "apisauce"
import { getGeneralApiProblem } from "./services/api/apiProblem"
import { Settings } from "react-native-fbsdk-next"
import { Logger } from "app/utils/utils"
import { AppEventType, EventBus } from "./utils/eventBus"
import { api } from "./services/api"
import { autofillParserAndroid } from "./utils/autofillHelper"
import { ThemeContextProvider } from "./services/context/useTheme"
import CombineContext from "./services/context/useCombineContext"

enableScreens()
Settings.initializeSDK()
Tracking.initSentry()
Tracking.initAppFlyer()

// setup({ storekitMode: 'STOREKIT2_MODE' });

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

export interface RootProp extends JSX.IntrinsicAttributes {
  lastFill?: number
  autofill?: number
  savePassword?: number
  domain?: string
  lastUserPasswordID?: string
  username?: string
  password?: string
  hideSplashScreen: () => Promise<void>
}

const App: ComponentType<RootProp> = (props: RootProp) => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null)
  setRootNavigation(navigationRef)
  useBackButtonHandler(navigationRef, canExit)
  const { initialNavigationState, onNavigationStateChange } = useNavigationPersistence(
    storage,
    NAVIGATION_PERSISTENCE_KEY,
  )
  const { rehydrated, rootStore } = useInitialRootStore(() => {
    // This runs after the root store has been initialized and rehydrated.

    // If your initialization scripts run very fast, it's good to show the splash screen for just a bit longer to prevent flicker.
    // Slightly delaying splash screen hiding for better UX; can be customized or removed as needed,
    // Note: (vanilla Android) The splash-screen will not appear if you launch your app via the terminal or Android Studio. Kill the app and launch it normally by tapping on the launcher icon. https://stackoverflow.com/a/69831106
    // Note: (vanilla iOS) You might notice the splash-screen logo change size. This happens in debug/development mode. Try building the app for release.
    setTimeout(props.hideSplashScreen, 500)
  })

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!rehydrated) return null

  // Set up API listener
  const monitorApiResponse = (response: ApiResponse<any>) => {
    const problem = getGeneralApiProblem(response)

    if (problem) {
      Logger.debug(
        `URL:${response.config.baseURL}${response.config.url} - Status: ${
          response.status
        } - Message: ${JSON.stringify(response.data)}`,
      )
    }

    if (problem) {
      if (problem.kind === "unauthorized") {
        const ignoredUrls = ["/users/logout", "/sso/auth"]
        const ignoredRoute = ["init", "intro", "onBoarding", "login", "forgotPassword", "signup"]
        const currentRoute = navigationRef.current.getCurrentRoute()

        if (
          !ignoredUrls.includes(response.config.url) &&
          !ignoredRoute.includes(currentRoute.name)
        ) {
          rootStore.user.setApiToken(null)
          rootStore.user.setLoggedIn(false)
          rootStore.user.setLoggedInPw(false)
          rootStore.cipherStore.lock()
          rootStore.collectionStore.lock()
          rootStore.folderStore.lock()
          rootStore.toolStore.lock()

          // Close all modals before navigate
          EventBus.emit(AppEventType.CLOSE_ALL_MODALS, null)
          if (navigationRef.current) {
            navigationRef.current.navigate("init")
          }
        }
      }
    }
  }
  const monitorApiRequest = (request) => async () => {
    Logger.debug(
      `Sending API ${request.method}  ${request.baseURL}${request.url} -- ${
        request.params ? JSON.stringify(request.params) : ""
      }`,
    )
  }

  api.apisauce.addMonitor(monitorApiResponse)
  api.apisauce.addAsyncRequestTransform(monitorApiRequest)

  // if app start from android autofill service. navigate to autofill screen
  autofillParserAndroid(props)

  // otherwise, we're ready to render the app
  return (
    <GestureHandlerRootView style={$style.container}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <CombineContext
          childProps={{
            navigationRef,
          }}
          components={[ThemeContextProvider]}
        >
          <RootNavigator
            ref={navigationRef}
            initialState={initialNavigationState}
            onStateChange={onNavigationStateChange}
          />
        </CombineContext>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const $style = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default __DEV__ ? App : Sentry.wrap(App)
