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
import { 
  SwitchDeviceScreen, StartScreen, BiometricUnlockIntroScreen, PasswordEditScreen, 
  PasswordInfoScreen , FolderActionScreen, PasswordGeneratorScreen, PasswordHealthScreen,
  DataBreachScannerScreen, NoteEditScreen, CardEditScreen, IdentityEditScreen
} from "../screens"
import UserInactivity from 'react-native-user-inactivity'
import { color } from "../theme"
import { INACTIVE_TIMEOUT } from "../config/constants"
import { useMixins } from "../services/mixins"
import { useNavigation } from "@react-navigation/native"

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
  passwordGenerator: undefined,
  passwordHealth: undefined,
  dataBreachScanner: undefined,
  passwords__info: undefined,
  passwords__edit: {
    mode: 'add' | 'edit'
  },
  folders__action: {
    mode: 'add' | 'move'
  },
  notes__edit: {
    mode: 'add' | 'edit'
  },
  cards__edit: {
    mode: 'add' | 'edit'
  },
  identities__edit: {
    mode: 'add' | 'edit'
  },
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createStackNavigator<PrimaryParamList>()

export function MainNavigator() {
  const navigation = useNavigation()
  const { lock } = useMixins()

  // App lock trigger
  const _handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === "active") {
      console.log('lock screen')
      // lock()
      // navigation.navigate('lock')
    }
  }

  // App inactive trigger
  const handleInactive = (isActive : boolean) => {
    if (!isActive) {
      console.log('lock screen due to inactive')
      // lock()
      // navigation.navigate('lock')
    }
  }

  // Life cycle
  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange)
    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
    };
  }, []);

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

        {/* Inner screens */}
        <Stack.Screen name="passwordGenerator" component={PasswordGeneratorScreen} />
        <Stack.Screen name="passwordHealth" component={PasswordHealthScreen} />
        <Stack.Screen name="dataBreachScanner" component={DataBreachScannerScreen} />

        <Stack.Screen name="passwords__info" component={PasswordInfoScreen} />
        <Stack.Screen name="passwords__edit" component={PasswordEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="folders__action" component={FolderActionScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="notes__edit" component={NoteEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="cards__edit" component={CardEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="identities__edit" component={IdentityEditScreen} initialParams={{ mode: 'add' }} />
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
