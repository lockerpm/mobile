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
import { CommonActions, NavigationContainerRef } from "@react-navigation/native"
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
import * as Tracking from "./utils/tracking"
import * as Sentry from "@sentry/react-native"
import { enableScreens } from "react-native-screens"
import { ApiResponse } from "apisauce"
import { getGeneralApiProblem } from "./services/api/apiProblem"
import { Settings } from "react-native-fbsdk-next"
import { Logger } from "app/utils/utils"
import { AppEventType, EventBus } from "./utils/eventBus"
import { api } from "./services/api"
import { ThemeContextProvider } from "./services/context/useTheme"
import CombineContext from "./services/context/useCombineContext"
import { IS_IOS } from "./config/constants"
import { AndroidAutofillServiceType } from "./utils/autofillHelper"
import SplashScreen from "react-native-splash-screen"
import BootSplash from "react-native-bootsplash"

enableScreens()
Settings.initializeSDK()
Tracking.initSentry()

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

export interface RootProp extends JSX.IntrinsicAttributes {
  lastFill?: number
  autofill?: number
  savePassword?: number
  domain?: string
  lastUserPasswordID?: string
  username?: string
  password?: string
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
    const hideSplash = IS_IOS ? BootSplash.hide : SplashScreen.hide
    setTimeout(hideSplash, 400)
  })

  if (!rehydrated) return null

  // Set up API listener
  const monitorApiResponse = (response: ApiResponse<any>) => {
    const problem = getGeneralApiProblem(response)

    if (problem) {
      Logger.debug(
        `URL:${response.config?.baseURL}${response.config?.url} - Status: ${
          response.status
        } - Message: ${JSON.stringify(response.data)}`,
      )
    }

    if (problem) {
      if (problem.kind === "unauthorized") {
        const ignoredUrls = ["/users/logout", "/sso/auth"]
        const ignoredRoute = ["init", "intro", "onBoarding", "login", "forgotPassword", "signup"]
        const currentRoute = navigationRef.current?.getCurrentRoute()

        if (
          !ignoredUrls.includes(response.config?.url || "") &&
          !ignoredRoute.includes(currentRoute?.name || "")
        ) {
          rootStore.user.setApiToken("")
          rootStore.user.setLoggedIn(false)
          rootStore.user.setLoggedInPw(false)
          rootStore.cipherStore.lock()
          rootStore.collectionStore.lock()
          rootStore.folderStore.lock()
          rootStore.toolStore.lock()

          // Close all modals before navigate
          EventBus.emit(AppEventType.CLOSE_ALL_MODALS, null)
          if (navigationRef.current) {
            navigationRef.current.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "init" }],
              }),
            )
          }
        }
      }
    }
  }
  // const monitorApiRequest = (request: any) => async () => {
  //   Logger.debug(
  //     `Sending API ${request.method}  ${request.baseURL}${request.url} -- ${
  //       request.params ? JSON.stringify(request.params) : ""
  //     }`,
  //   )
  // }

  api.apisauce.addMonitor(monitorApiResponse)
  // api.apisauce.addAsyncRequestTransform(monitorApiRequest)

  // if app start from android autofill service. navigate to autofill screen
  if (!IS_IOS) {
    const {
      lastFill = 0,
      autofill = 0,
      savePassword = 0,
      domain = "",
      lastUserPasswordID = "",
      username = "",
      password = "",
    } = props

    if (autofill || lastFill || savePassword) {
      let type = AndroidAutofillServiceType.AUTOFILL
      if (lastFill) type = AndroidAutofillServiceType.AUTOFILL_ITEM
      if (savePassword) type = AndroidAutofillServiceType.SAVE_REQUEST
      rootStore.uiStore.setAndroidAutofillServiceData(true, {
        type,
        lastUserPasswordID,
        domain,
        username,
        password,
      })
    } else {
      rootStore.uiStore.setAndroidAutofillServiceData(false, null)
    }
  }

  // otherwise, we're ready to render the app
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

export default __DEV__ ? App : Sentry.wrap(App)
