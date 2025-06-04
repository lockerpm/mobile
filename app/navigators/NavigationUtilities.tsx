import { useEffect, useRef } from "react"
import { BackHandler } from "react-native"
import {
  PartialState,
  NavigationState,
  createNavigationContainerRef,
} from "@react-navigation/native"
import { IS_PROD } from "../config/constants"
import { trackScreenView } from "app/utils/analytics"
import { RootParamList } from "./navigators.types"

export const navigationRef = createNavigationContainerRef<RootParamList>()

/**
 * Gets the current screen from any navigation state.
 * @param {NavigationState | PartialState<NavigationState>} state - The navigation state to traverse.
 * @returns {string} - The name of the current screen.
 */
export function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): string {
  const route = state.routes[state.index ?? 0]

  // Found the active route -- return the name
  if (!route.state) return route.name as keyof RootParamList

  // Recursive call to deal with nested routers
  return getActiveRouteName(route.state as NavigationState<RootParamList>)
}

/**
 * Hook that handles Android back button presses and forwards those on to
 * the navigation or allows exiting the app.
 */
export function useBackButtonHandler(canExit: (routeName: string) => boolean) {
  const canExitRef = useRef(canExit)

  useEffect(() => {
    canExitRef.current = canExit
  }, [canExit])

  useEffect(() => {
    // We'll fire this when the back button is pressed on Android.
    const onBackPress = () => {
      if (!navigationRef.isReady()) {
        return false
      }
      const navigation = navigationRef

      if (navigation == null) {
        return false
      }

      // grab the current route
      const routeName = getActiveRouteName(navigation.getRootState())

      // are we allowed to exit?
      if (canExitRef.current(routeName)) {
        // let the system know we've not handled this event
        return false
      }

      // we can't exit, so let's turn this into a back action
      if (navigation.canGoBack()) {
        navigation.goBack()

        return true
      }

      return false
    }

    // Subscribe when we come to life
    BackHandler.addEventListener("hardwareBackPress", onBackPress)

    // Unsubscribe when we're done
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress)
  }, [])
}

/**
 * Custom hook for persisting navigation state.
 */
export function useNavigationPersistence() {
  const routeNameRef = useRef("")

  const onNavigationStateChange = (state: any) => {
    const previousRouteName = routeNameRef.current
    const currentRouteName = getActiveRouteName(state)

    if (previousRouteName !== currentRouteName) {
      if (!__DEV__ && IS_PROD) {
        // track screens.
        trackScreenView(currentRouteName)
      }
    }

    // Save the current route name for later comparision
    routeNameRef.current = currentRouteName
  }

  return { onNavigationStateChange }
}
