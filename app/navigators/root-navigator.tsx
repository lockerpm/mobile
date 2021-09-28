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
  IntroScreen, InitScreen, OnboardingScreen, LockScreen, LoginScreen, SignupScreen, CreateMasterPasswordScreen 
} from "../screens"
import { color } from "../theme"
import { useMixins } from "../services/mixins"
import { useStores } from "../models"

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
  signup: undefined,
  createMasterPassword: undefined,
  mainStack: undefined
}

const Stack = createStackNavigator<RootParamList>()

const RootStack = () => {
  const { notify, translate } = useMixins()
  const { uiStore } = useStores()

  useEffect(() => {
    if (uiStore.showNetworkError) {
      notify('error', translate('error.network_error'))
      uiStore.setShowNetworkError(false)
    }
  }, [uiStore.showNetworkError])

  useEffect(() => {
    // Check network
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable)
      uiStore.setIsOffline(offline)
    })

    return removeNetInfoSubscription
  }, [])

  return (
    <Stack.Navigator
      initialRouteName="init"
      screenOptions={{
        cardStyle: { backgroundColor: color.palette.white },
        headerShown: false,
      }}
    >
      <Stack.Screen name="init" component={InitScreen} />
      <Stack.Screen name="intro" component={IntroScreen} />
      <Stack.Screen name="onBoarding" component={OnboardingScreen} />
      <Stack.Screen name="lock" component={LockScreen} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signup" component={SignupScreen} />
      <Stack.Screen name="createMasterPassword" component={CreateMasterPasswordScreen} />
      <Stack.Screen
        name="mainStack"
        component={MainNavigator}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

export const RootNavigator = React.forwardRef<
  NavigationContainerRef,
  Partial<React.ComponentProps<typeof NavigationContainer>>
>((props, ref) => {
  return (
    <NavigationContainer {...props} ref={ref}>
      <RootStack />
    </NavigationContainer>
  )
})

RootNavigator.displayName = "RootNavigator"
