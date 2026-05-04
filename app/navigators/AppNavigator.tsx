/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { ComponentProps, useEffect, useMemo } from "react"
import { Platform } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import Toast, { BaseToastProps } from "react-native-toast-message"

import { ErrorToast, InfoToast, SuccessToast } from "app/components/cores"

import { useStores } from "@/models"
import * as Screens from "@/screens"
import { AndroidAppProps } from "@/utils/autofill.android"
import { Logger } from "@/utils/logger"
import { useAppTheme, useThemeProvider } from "@/utils/useAppTheme"

import Config from "../config"
import { modalScreenOptions, navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { AppRoute } from "./navigators.types"
import { useMonitorApiResponse } from "./useMonitorApiResponse"
import { useLiveOtpAuthDeeplinkHandler } from "./useOtpAuthDeeplinkHandler"

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

type AppProps = {
  fido2: AndroidAppProps // android credential provider and autofill service
}
const AppStack = observer(function AppStack(props: AppProps) {
  const {
    theme: { colors },
  } = useAppTheme()
  const { uiStore } = useStores()

  // ------------------- EFFECTS -------------------
  useLiveOtpAuthDeeplinkHandler()

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
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="init"
        component={Screens.SplashScreen}
        initialParams={{
          fido2: props.fido2,
        }}
      />
      <Stack.Screen name="lock" component={Screens.LockScreen} />
      <Stack.Screen
        name="authStack"
        component={Screens.AuthStack}
        initialParams={{
          fido2: props.fido2,
        }}
      />
      <Stack.Screen name="unAuthStack" component={Screens.UnAuthStack} />
      <Stack.Screen
        name="encryptionConfigModal"
        component={Screens.EncryptionConfigModal}
        options={modalScreenOptions}
      />
    </Stack.Navigator>
  )
})

export type NavigationProps = Partial<ComponentProps<typeof NavigationContainer<AppRoute>>> &
  AppProps

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

  const enableDeeplink = !(Platform.OS === "android" && props.fido2.type)

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <NavigationContainer
        ref={navigationRef}
        theme={navigationTheme}
        linking={enableDeeplink ? linking : undefined}
        {...props}
      >
        <AppStack fido2={props.fido2} />
        <Toast position="top" config={toastConfig} />
      </NavigationContainer>
    </ThemeProvider>
  )
})
