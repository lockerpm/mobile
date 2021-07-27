/**
 * This is the navigator you will modify to display the logged-in screens of your app.
 * You can use RootNavigator to also display an auth flow or other user flows.
 *
 * You'll likely spend most of your time in this file.
 */
import React, { useEffect } from "react"
import { AppState } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { MainTabNavigator } from "./main-tab-navigator"
import { SwitchDeviceScreen, StartScreen, BiometricUnlockIntroScreen } from "../screens"
import UserInactivity from 'react-native-user-inactivity'
import { color } from "../theme"
import { INACTIVE_TIMEOUT } from "../config/constants"
import { useStores } from "../models"
import { useMixins } from "../services/mixins"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type PrimaryParamList = {
  start: undefined,
  switchDevice: undefined,
  biometricUnlockIntro: undefined,
  mainTab: undefined,
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createStackNavigator<PrimaryParamList>()

export function MainNavigator() {
  const { lock, monitorApiResponse } = useMixins()

  // App lock trigger
  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange)
    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
    };
  }, []);
  const _handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === "active") {
      lock()
    }
  }

  // App inactive trigger
  const handleInactive = (isActive : boolean) => {
    if (!isActive) {
      lock()
    }
  }

  // Auto API error handling
  const { user } = useStores()
  user.environment.api.apisauce.addMonitor(monitorApiResponse)

  return (
    <UserInactivity
      timeForInactivity={INACTIVE_TIMEOUT}
      onAction={handleInactive}
    >
      <Stack.Navigator
        initialRouteName="start"
        screenOptions={{
          cardStyle: { backgroundColor: color.palette.white },
          headerShown: false
        }}
      >
        <Stack.Screen name="start" component={StartScreen} />
        <Stack.Screen name="switchDevice" component={SwitchDeviceScreen} />
        <Stack.Screen name="biometricUnlockIntro" component={BiometricUnlockIntroScreen} />
        <Stack.Screen name="mainTab" component={MainTabNavigator} />
      </Stack.Navigator>
    </UserInactivity>
  )
}

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ["start", "mainTab", "switchDevice", "biometricUnlockIntro"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
