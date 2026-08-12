/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */

import "./utils/gestureHandler"
import { FC, useEffect, useState } from "react"
import { Platform, StatusBar } from "react-native"
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import * as Sentry from "@sentry/react-native"
import { Settings } from "react-native-fbsdk-next"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { initI18n, LanguageSupportType, LocaleContextProvider } from "./i18n"
import { useInitialRootStore } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { usePushMessageHandlers } from "./services/hook/usePushMessageHandlers"
import { customFontsToLoad } from "./theme"
import { setAndroidAutofillServiceData, AndroidAppProps } from "./utils/autofill.android"
import { initCrashReporting } from "./utils/crashReporting"
import { loadDateFnsLocale } from "./utils/formatDate"

initCrashReporting()
Settings.initializeSDK()

type AppProps = AndroidAppProps & {}

const App: FC<AppProps> = (props) => {
  setAndroidAutofillServiceData(props)
  const { onNavigationStateChange, isRestored: isNavigationStateRestored } =
    useNavigationPersistence()

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState<null | string>(null)

  usePushMessageHandlers()

  useEffect(() => {
    initI18n()
      .then((i18n) => {
        setIsI18nInitialized(i18n.language)
      })
      .then(() => loadDateFnsLocale())
  }, [])

  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(true)
      StatusBar.setBackgroundColor("transparent")
    }
  }, [])

  const { rehydrated } = useInitialRootStore(() => {
    // This runs after the root store has been initialized and rehydrated.

    // If your initialization scripts run very fast, it's good to show the splash screen for just a bit longer to prevent flicker.
    // Slightly delaying splash screen hiding for better UX; can be customized or removed as needed,
    setTimeout(SplashScreen.hideAsync, 500)
  })

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (
    !rehydrated ||
    !isNavigationStateRestored ||
    !isI18nInitialized ||
    (!areFontsLoaded && !fontLoadError)
  ) {
    return null
  }

  // otherwise, we're ready to render the app
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <LocaleContextProvider initLanguage={isI18nInitialized as LanguageSupportType}>
          <AppNavigator onStateChange={onNavigationStateChange} fido2={props} />
        </LocaleContextProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}

export default __DEV__ ? App : Sentry.wrap(App)
