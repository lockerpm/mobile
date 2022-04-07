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
import { ErrorToast, SuccessToast } from "./helpers/toast"
import { Logger } from "../utils/logger"
import { PushNotifier } from "../utils/push-notification"
import { NotifeeNotificationData } from "../utils/push-notification/types"
import { save, StorageKey } from "../utils/storage"

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
  init: undefined,
  intro: undefined,
  onBoarding: undefined,
  lock: undefined,
  login: undefined,
  forgotPassword: undefined,
  signup: undefined,
  createMasterPassword: undefined,
  mainStack: undefined,
  countrySelector: {
    initialId?: string,
  }
}

const Stack = createStackNavigator<RootParamList>()

type Props = {
  navigationRef: any
}
const RootStack = observer((props: Props) => {
  const { navigationRef } = props
  const { color, parsePushNotiData } = useMixins()
  const { uiStore, user } = useStores()

  const handleForegroundNotiPress = async (data: NotifeeNotificationData) => {
    if (!data) {
      return
    }

    const res = await parsePushNotiData({
      notifeeData: data
    })

    if (user.isLoggedInPw) {
      navigationRef.current.navigate(res.path, res.params)
    } else {
      save(StorageKey.PUSH_NOTI_DATA, {
        type: data.type
      })
    }
  }

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
      <Stack.Screen name="lock" component={LockScreen} />
      <Stack.Screen name="login" component={LoginScreen} />
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
