/**
 * The root navigator is used to switch between major navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow (which is contained in your MainNavigator) which the user
 * will use once logged in.
 */
import React, { useEffect } from "react"
import NetInfo from "@react-native-community/netinfo"
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { MainNavigator } from "./main-navigator"
import {
  IntroScreen, InitScreen, OnboardingScreen, LockScreen, LoginScreen, SignupScreen,
  CreateMasterPasswordScreen, ForgotPasswordScreen, CountrySelectorScreen
} from "../screens"
import { useStores } from "../models"
import Toast, { BaseToastProps } from 'react-native-toast-message'
import { observer } from "mobx-react-lite"
import { useMixins } from "../services/mixins"
import { ErrorToast, SuccessToast, InfoToast } from "./helpers/toast"
import { Logger } from "../utils/logger"
import { PushNotifier } from "../utils/push-notification"
import { NotifeeNotificationData } from "../utils/push-notification/types"
import { save, StorageKey } from "../utils/storage"
import dynamicLinks from '@react-native-firebase/dynamic-links'
import { AppState } from "react-native"
import { AppEventType, EventBus } from "../utils/event-bus"
import { useCipherAuthenticationMixins } from "../services/mixins/cipher/authentication"
import { TestScreen } from "../screens/test-screen"
import { LoginSelectScreen } from "../screens/unauth/login-select/login-select-screen"


/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * We recommend using MobX-State-Tree store(s) to handle state rather than navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type RootParamList = {
  init: undefined
  intro: {
    preview?: boolean
  }
  onBoarding: undefined
  lock:  {
    type?: "individual" | "business" | "enterprise"
  }
  login: {
    type?: "individual" | "business" | "enterprise"
  }
  forgotPassword: undefined
  signup: undefined
  createMasterPassword: undefined
  mainStack: undefined
  countrySelector: {
    initialId?: string
  }
  loginSelect: undefined
  test: undefined
}

const Stack = createStackNavigator<RootParamList>()

type Props = {
  navigationRef: any
}
const RootStack = observer((props: Props) => {
  const { navigationRef } = props
  const { color, parsePushNotiData } = useMixins()
  const { clearAllData, handleDynamicLink } = useCipherAuthenticationMixins()
  const { uiStore, user } = useStores()

  // ------------------- METHODS -------------------

  // Notification
  const handleForegroundNotiPress = async (data: NotifeeNotificationData) => {
    if (!data) {
      return
    }

    const res = await parsePushNotiData({
      notifeeData: data
    })

    if (user.isLoggedInPw) {
      // Close all modals before navigate
      EventBus.emit(AppEventType.CLOSE_ALL_MODALS, null)
      if (navigationRef.current) {
        navigationRef.current.navigate(res.path, res.params)
      }
    } else {
      save(StorageKey.PUSH_NOTI_DATA, {
        type: data.type
      })
    }
  }

  // App state change
  const _handleAppStateChange = async (nextAppState: string) => {
    Logger.debug(nextAppState)

    // Ohter state (background/inactive)
    if (nextAppState !== 'active') {
      return
    }

    const link = await dynamicLinks().getInitialLink()
    Logger.debug(`DYNAMIC LINK BACKGROUND: ${JSON.stringify(link)}`)
    link?.url && handleDynamicLink(link.url, navigationRef.current)
  }

  // ------------------- EFFECTS -------------------

  // Check internet connection
  useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected
      Logger.debug(offline ? 'OFFLINE' : 'ONLINE')
      uiStore.setIsOffline(offline)
    })

    return () => {
      removeNetInfoSubscription()
    }
  }, [])

  // Push notification handler
  useEffect(() => {
    const unsubscribe = PushNotifier.setupForegroundHandler({
      handleForegroundPress: handleForegroundNotiPress
    })
    return () => {
      unsubscribe()
    }
  }, [])

  // Dynamic links foreground handler
  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink((link) => {
      Logger.debug(`DYNAMIC LINK FOREGROUND: ${JSON.stringify(link)}`)
      link?.url && handleDynamicLink(link.url, navigationRef.current)
    })
    return () => unsubscribe()
  }, [])

  // Dynamic links background handler
  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange)
    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
    }
  }, [])

  // Clear user data on signal
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.CLEAR_ALL_DATA, () => {
      clearAllData(true)
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  // -------------------- RENDER ----------------------

  return (
    <Stack.Navigator
      initialRouteName="init"
      screenOptions={{
        cardStyle: { backgroundColor: color.background },
        headerShown: false
      }}
    >
      <Stack.Screen name="init" component={InitScreen} />
      <Stack.Screen name="intro" component={IntroScreen} />
      <Stack.Screen name="onBoarding" component={OnboardingScreen} />
      <Stack.Screen name="loginSelect" component={LoginSelectScreen} />
      <Stack.Screen name="lock" component={LockScreen} initialParams={{type: "individual"}} />
      <Stack.Screen name="login" component={LoginScreen} initialParams={{type: "individual"}} />
      <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="signup" component={SignupScreen} />
      <Stack.Screen name="createMasterPassword" component={CreateMasterPasswordScreen} />
      <Stack.Screen name="countrySelector" component={CountrySelectorScreen} />
      <Stack.Screen
        name="mainStack"
        component={MainNavigator}
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen name="test" component={TestScreen} />
    </Stack.Navigator>
  )
})


export const RootNavigator = React.forwardRef<
  NavigationContainerRef,
  Partial<React.ComponentProps<typeof NavigationContainer>>
>((props, ref) => {
  // Toast
  const toastConfig = {
    success: (props: BaseToastProps) => (
      <SuccessToast {...props} />
    ),
    error: (props: BaseToastProps) => (
      <ErrorToast {...props} />
    ),
    info: (props: BaseToastProps) => (
      <InfoToast {...props} />
    )
  }

  return (
    <NavigationContainer {...props} ref={ref}>
      <RootStack navigationRef={ref} />
      <Toast config={toastConfig} />
    </NavigationContainer>
  )
})

RootNavigator.displayName = "RootNavigator"
