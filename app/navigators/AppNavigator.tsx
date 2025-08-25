/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import NetInfo from "@react-native-community/netinfo"
import { observer } from "mobx-react-lite"
import * as Screens from "@/screens"
import Config from "../config"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { useAppTheme, useThemeProvider } from "@/utils/useAppTheme"
import { ComponentProps, useEffect, useMemo } from "react"
import { AppRoute } from "./navigators.types"
import Toast, { BaseToastProps } from "react-native-toast-message"
import { ErrorToast, InfoToast, SuccessToast } from "app/components/cores"
import { useStores } from "@/models"
import { Logger } from "@/utils/logger"
import { useMonitorApiResponse } from "./useMonitorApiResponse"
import { isAndroidAutofillService } from "@/utils/autofillHelper"

const exitRoutes = Config.exitRoutes

const linking = {
  prefixes: ["https://id.locker.io", "locker://"],
  config: {
    screens: {
      unAuthStack: {
        screens: {
          loginStack: {
            screens: {
              loginByPincode: {
                path: "login/quick",
              },
            },
          },
          activateAccount: {
            path: "confirmation/:token",
            parse: {
              token: (token: string) => decodeURIComponent(token),
            },
          },
        },
      },
    },
  },
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppRoute>()

const AppStack = observer(function AppStack() {
  const {
    theme: { colors },
  } = useAppTheme()
  const { uiStore } = useStores()

  // ------------------- EFFECTS -------------------

  useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      Logger.debug(!state.isConnected ? "OFF-LINE" : "ON-LINE")
      uiStore.setIsOffline(!state.isConnected)
    })

    return () => {
      removeNetInfoSubscription()
    }
  }, [])

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="init" component={Screens.SplashScreen} />
      <Stack.Screen name="lock" component={Screens.LockScreen} />
      <Stack.Screen name="authStack" component={Screens.AuthStack} />
      <Stack.Screen name="unAuthStack" component={Screens.UnAuthStack} />
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppRoute>>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const { themeScheme, navigationTheme, setThemeContextOverride, ThemeProvider } =
    useThemeProvider()
  const rootStore = useStores()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))
  useMonitorApiResponse(rootStore)

  // Toast
  const toastConfig = useMemo(
    () => ({
      success: (props: BaseToastProps) => <SuccessToast {...props} />,
      error: (props: BaseToastProps) => <ErrorToast {...props} />,
      info: (props: BaseToastProps) => <InfoToast {...props} />,
    }),
    []
  )

  const enableDeeplink = !isAndroidAutofillService

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <NavigationContainer
        ref={navigationRef}
        theme={navigationTheme}
        linking={enableDeeplink ? linking : undefined}
        {...props}
      >
        <AppStack />
        <Toast position="top" config={toastConfig} />
      </NavigationContainer>
    </ThemeProvider>
  )
})
