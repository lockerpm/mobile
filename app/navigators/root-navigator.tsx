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
import { color as colorLight, colorDark, fontSize } from "../theme"
import { useStores } from "../models"
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message'
import { Linking } from "react-native"
import { observer } from "mobx-react-lite"

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

const RootStack = observer(() => {
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  const handleDeepLinking = async (url: string | null) => {
    __DEV__ && console.log(`Deep link ${url}`)
    if (!url) {
      return
    }

    const path = url.split('://')[1]
    if (path.startsWith('add?domain=')) {
      const domain = path.split('domain=')[1]
      uiStore.setDeepLinkAction('add', domain)
      return
    }
    if (path === 'save?domain=') {
      const domain = path.split('domain=')[1]
      uiStore.setDeepLinkAction('save', domain)
      return
    }
  }

  // Prevent store from being called too soon and break the initialization
  let removeNetInfoSubscription = () => {}

  useEffect(() => {
    // Check network (delay to protect the store initialization)
    setTimeout(() => {
      removeNetInfoSubscription = NetInfo.addEventListener((state) => {
        const offline = !state.isInternetReachable
        __DEV__ && console.log(offline ? 'OFFLINE' : 'ONLINE')
        uiStore.setIsOffline(offline)
      })
    }, 2000)

    // Check deep linking
    Linking.getInitialURL().then(handleDeepLinking)
    const checkDeepLinking = ({ url }) => {
      handleDeepLinking(url)
    }
    Linking.addEventListener('url', checkDeepLinking)


    return () => {
      removeNetInfoSubscription()
      Linking.removeEventListener('url', checkDeepLinking)
    }
  }, [])

  return (
    <Stack.Navigator
      initialRouteName="init"
      screenOptions={{
        cardStyle: { backgroundColor: color.background },
        headerShown: false,
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
        }}
      />
    </Stack.Navigator>
  )
})

const SuccessToast = observer((props: BaseToastProps) => {
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  return (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: color.primary,
        backgroundColor: uiStore.isDark ? color.block : color.background
      }}
      text2Style={{
        color: color.primary,
        fontSize: fontSize.small
      }}
      leadingIcon={require('../common/images/icons/success.png')}
    />
  )
})

const ErrorToast = observer((props: BaseToastProps) => {
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  return (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: color.error,
        backgroundColor: uiStore.isDark ? color.block : color.background
      }}
      text2Style={{
        color: color.error,
        fontSize: fontSize.small
      }}
      leadingIcon={require('../common/images/icons/error.png')}
    />
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
      <RootStack />
      <Toast ref={(ref) => Toast.setRef(ref)} config={toastConfig} />
    </NavigationContainer>
  )
})

RootNavigator.displayName = "RootNavigator"
