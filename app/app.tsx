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
import './i18n'
import './utils/ignoreWarnings'
import React, { useState, useEffect, useRef } from 'react'
import { NavigationContainerRef } from '@react-navigation/native'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import SplashScreen from 'react-native-splash-screen'
import * as storage from './utils/storage'
import {
  useBackButtonHandler,
  RootNavigator,
  canExit,
  setRootNavigation,
  useNavigationPersistence,
} from './navigators'
import { RootStore, RootStoreProvider, setupRootStore } from './models'
import * as Tracking from './utils/tracking'
import * as Sentry from '@sentry/react-native'
// This puts screens in a native ViewController or Activity. If you want fully native
// stack navigation, use `createNativeStackNavigator` in place of `createStackNavigator`:
// https://github.com/kmagiera/react-native-screens#using-native-stack-navigator
import { enableScreens } from 'react-native-screens'
import { MixinsProvider } from './services/mixins'

// Custom extras
import { ApiResponse } from 'apisauce'
import { getGeneralApiProblem } from './services/api/apiProblem'
import { Settings } from 'react-native-fbsdk-next'
import CombineContext from './services/mixins/combine-context'
import { CipherHelpersMixinsProvider } from './services/mixins/cipher/helpers'
import { CipherAuthenticationMixinsProvider } from './services/mixins/cipher/authentication'
import { CipherDataMixinsProvider } from './services/mixins/cipher/data'
import { CipherToolsMixinsProvider } from './services/mixins/cipher/tools'
import { Logger } from 'app/utils/utils'
import { SocialLoginMixinsProvider } from './services/mixins/social-login'
import { AdaptiveLayoutMixinsProvider } from './services/mixins/adaptive-layout'
import { IS_PROD } from './config/constants'
import { AppEventType, EventBus } from './utils/eventBus'
import { FolderMixinsProvider } from './services/mixins/folder'
import { api } from './services/api'
import { autofillParserAndroid } from './utils/autofillHelper'
import { ThemeContextProvider } from './services/context/useTheme'

enableScreens()
Settings.initializeSDK()
Tracking.initSentry()
Tracking.initAppFlyer()

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE'

export type RootProp = {
  lastFill?: number
  autofill?: number
  savePassword?: number
  domain?: string
  lastUserPasswordID?: string
  username?: string
  password?: string
}

/**
 * This is the root component of our app.
 */
function App(props: RootProp) {
  const navigationRef = useRef<NavigationContainerRef>(null)
  const [rootStore, setRootStore] = useState<RootStore | undefined>(undefined)

  setRootNavigation(navigationRef)
  useBackButtonHandler(navigationRef, canExit)
  const { initialNavigationState, onNavigationStateChange } = useNavigationPersistence(
    storage,
    NAVIGATION_PERSISTENCE_KEY
  )

  // Kick off initial async loading actions, like loading fonts and RootStore
  useEffect(() => {
    ;(async () => {
      setupRootStore().then(setRootStore)
      SplashScreen.hide()
    })()
  }, [])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color. You can replace
  // with your own loading component if you wish.
  if (!rootStore) return null

  // Set up API listener
  const monitorApiResponse = (response: ApiResponse<any>) => {
    const problem = getGeneralApiProblem(response)

    if (problem) {
      Logger.debug(
        `URL:${response.config.baseURL}${response.config.url} - Status: ${
          response.status
        } - Message: ${JSON.stringify(response.data)}`
      )
    }

    if (problem) {
      if (problem.kind === 'unauthorized') {
        const ignoredUrls = ['/users/logout', '/sso/auth']
        const ignoredRoute = ['init', 'intro', 'onBoarding', 'login', 'forgotPassword', 'signup']
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
            rootStore.uiStore.setFirstRouteAfterInit('login')
            navigationRef.current.navigate('init')
          }
        }
      }
    }
  }
  const monitorApiRequest = (request) => async () => {
    Logger.debug(
      `Sending API ${request.method}  ${request.baseURL}${request.url} -- ${
        request.params ? JSON.stringify(request.params) : ''
      }`
    )
  }

  api.apisauce.addMonitor(monitorApiResponse)
  api.apisauce.addAsyncRequestTransform(monitorApiRequest)

  // if app start from android autofill service. navigate to autofill screen
  autofillParserAndroid(props)

  // otherwise, we're ready to render the app
  return (
    <RootStoreProvider value={rootStore}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <CombineContext
          childProps={{
            navigationRef: navigationRef,
          }}
          components={[
            ThemeContextProvider,
            MixinsProvider,
            SocialLoginMixinsProvider,
            CipherHelpersMixinsProvider,
            CipherAuthenticationMixinsProvider,
            CipherDataMixinsProvider,
            CipherToolsMixinsProvider,
            AdaptiveLayoutMixinsProvider,
            FolderMixinsProvider,
          ]}
        >
          <RootNavigator
            ref={navigationRef}
            initialState={initialNavigationState}
            onStateChange={onNavigationStateChange}
          />
        </CombineContext>
      </SafeAreaProvider>
    </RootStoreProvider>
  )
}

export default __DEV__ && !IS_PROD ? App : Sentry.wrap(App)
