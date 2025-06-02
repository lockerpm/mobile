import React, { useEffect } from "react"
import NetInfo from "@react-native-community/netinfo"
import { DefaultTheme, NavigationContainer, NavigationContainerRef } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import Toast, { BaseToastProps } from "react-native-toast-message"
import { observer } from "mobx-react-lite"
import { useStores } from "../models"
import { ErrorToast, InfoToast, SuccessToast } from "app/components/utils"
import { SplashScreen, LockScreen } from "../screens/init"
import { useAuthentication } from "app/services/hook"
import { useTheme } from "app/services/context"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { Logger } from "app/utils/utils"
import { RootParamList } from "./navigators.types"
import { LockType } from "app/static/types"
import { MainNavigator } from "./MainNavigator"
import { UnAuthStack } from "app/screens"

const Stack = createStackNavigator<RootParamList>()

const RootStack = observer(() => {
  const { setIsDark } = useTheme()
  const { clearAllData } = useAuthentication()
  const { uiStore } = useStores()

  // ------------------- EFFECTS -------------------

  useEffect(() => {
    setIsDark(uiStore.isDark || false)

    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected
      Logger.debug(offline ? "OFFLINE" : "ONLINE")
      uiStore.setIsOffline(offline)
    })

    const listener = EventBus.createListener(AppEventType.CLEAR_ALL_DATA, () => {
      clearAllData(true)
    })
    return () => {
      removeNetInfoSubscription()
      EventBus.removeListener(listener)
    }
  }, [])

  // -------------------- RENDER ----------------------

  return (
    <Stack.Navigator
      initialRouteName="init"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="init" component={SplashScreen} />
      <Stack.Screen
        name="lock"
        component={LockScreen}
        initialParams={{ type: LockType.Individual }}
      />
      <Stack.Screen name="mainStack" component={MainNavigator} />
      <Stack.Screen name="unAuthStack" component={UnAuthStack} />
    </Stack.Navigator>
  )
})

export const RootNavigator = React.forwardRef<
  NavigationContainerRef<any>,
  Partial<React.ComponentProps<typeof NavigationContainer>>
>((props, ref) => {
  const { colors } = useTheme()
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
    },
  }
  // Toast
  const toastConfig = {
    success: (props: BaseToastProps) => <SuccessToast {...props} />,
    error: (props: BaseToastProps) => <ErrorToast {...props} />,
    info: (props: BaseToastProps) => <InfoToast {...props} />,
  }

  return (
    <NavigationContainer {...props} theme={MyTheme} ref={ref}>
      <RootStack />
      <Toast config={toastConfig} />
    </NavigationContainer>
  )
})

RootNavigator.displayName = "RootNavigator"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes: string[] = ["init", "onBoarding"]

export const canExit = (routeName: string) => exitRoutes.includes(routeName)
