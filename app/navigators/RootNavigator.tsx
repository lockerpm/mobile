/**
 * The root navigator is used to switch between major navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow (which is contained in your MainNavigator) which the user
 * will use once logged in.
 */
import React, { useEffect, useState } from "react"
import { AppState, Modal, Platform, View } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Toast, { BaseToastProps } from "react-native-toast-message"
import dynamicLinks from "@react-native-firebase/dynamic-links"
import WebView from "react-native-webview"
import { observer } from "mobx-react-lite"
import { useStores } from "../models"
import { OnPremiseIdentifierData, OnPremisePreloginData } from "app/static/types"
import { ErrorToast, InfoToast, SuccessToast } from "app/components/utils"
import {
  IntroScreen,
  InitScreen,
  OnboardingScreen,
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
  LockType,
} from "../screens"
import { MainNavigator } from "./MainNavigator"
import { useAuthentication, useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { NotifeeNotificationData, PushNotifier } from "app/utils/pushNotification"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { StorageKey, save } from "app/utils/storage"
import { Logger } from "app/utils/utils"
import { Header } from "app/components/cores"

const IS_IOS = Platform.OS === "ios"

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
  lock: {
    type?: LockType
    // onpremise data
    data?: OnPremisePreloginData
    email?: string
  }
  login: undefined
  forgotPassword: undefined
  signup: undefined
  createMasterPassword: undefined
  mainStack: undefined

  // vinsso
  ssoIdentifier: undefined
  ssoLogin: OnPremiseIdentifierData
}

export type RootStackScreenProps<T extends keyof RootParamList> = StackScreenProps<RootParamList, T>

const Stack = createStackNavigator<RootParamList>()

type Props = {
  navigationRef: any
}
const RootStack = observer((props: Props) => {
  const { navigationRef } = props
  const { colors } = useTheme()
  const { parsePushNotiData } = useHelper()
  const { clearAllData, handleDynamicLink } = useAuthentication()
  const { uiStore, user } = useStores()
  const insets = useSafeAreaInsets()
  const [updateBlogUrl, setUpdateBlogUrl] = useState("")
  // ------------------- METHODS -------------------

  const androidHandleNotiPress = async () => {
    const res = await parsePushNotiData({
      tipTrick: true,
    })
    if (res.url) setUpdateBlogUrl(res.url)
  }
  // Notification
  const handleForegroundNotiPress = async (data: NotifeeNotificationData) => {
    if (!data) {
      return
    }

    const res = await parsePushNotiData({
      notifeeData: data,
      tipTrick: true,
    })
    if (res.url) setUpdateBlogUrl(res.url)

    if (user.isLoggedInPw) {
      // Close all modals before navigate
      EventBus.emit(AppEventType.CLOSE_ALL_MODALS, null)
      if (navigationRef.current) {
        navigationRef.current.navigate(res.path, res.params)
      }
    } else {
      !res.url &&
        save(StorageKey.PUSH_NOTI_DATA, {
          type: data.type,
          // url: data.url,
        })
    }
  }

  // App state change
  const _handleAppStateChange = async (nextAppState: string) => {
    Logger.debug(nextAppState)

    // Ohter state (background/inactive)
    if (nextAppState !== "active") {
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
      Logger.debug(offline ? "OFFLINE" : "ONLINE")
      uiStore.setIsOffline(offline)
    })

    return () => {
      removeNetInfoSubscription()
    }
  }, [])

  // Push notification handler
  useEffect(() => {
    !IS_IOS && androidHandleNotiPress()
    const unsubscribe = PushNotifier.setupForegroundHandler({
      handleForegroundPress: handleForegroundNotiPress,
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
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="init"
        screenOptions={{
          cardStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="init" component={InitScreen} />
        <Stack.Screen name="intro" component={IntroScreen} />
        <Stack.Screen name="onBoarding" component={OnboardingScreen} />

        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="signup" component={SignupScreen} />
        {/* <Stack.Screen
          name="lock"
          component={LockScreen}
          initialParams={{ type: LockType.Individual }}
        />    */}
        {/* <Stack.Screen name="createMasterPassword" component={CreateMasterPasswordScreen} /> */}
        <Stack.Screen
          name="mainStack"
          component={MainNavigator}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
      <Modal
        visible={!!updateBlogUrl}
        animationType="slide"
        onRequestClose={() => {
          setUpdateBlogUrl("")
        }}
        supportedOrientations={["portrait", "landscape"]}
      >
        <View
          style={{
            paddingTop: IS_IOS ? insets.top : 0,
            paddingBottom: insets.bottom,
            flex: 1,
            backgroundColor: colors.background,
          }}
        >
          <WebView
            incognito
            startInLoadingState
            source={{ uri: updateBlogUrl }}
            originWhitelist={["https://*", "com.cystack.locker://*"]}
          />
          <View
            style={{
              left: 0,
              right: 0,
              top: IS_IOS ? insets.top : 0,
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: colors.background,
              position: "absolute",
              borderBottomColor: colors.border,
              borderBottomWidth: 0.5,
            }}
          >
            <Header
              leftIcon="arrow-left"
              onLeftPress={() => {
                setUpdateBlogUrl("")
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
})

export const RootNavigator = React.forwardRef<
  NavigationContainerRef<any>,
  Partial<React.ComponentProps<typeof NavigationContainer>>
>((props, ref) => {
  // Toast
  const toastConfig = {
    success: (props: BaseToastProps) => <SuccessToast {...props} />,
    error: (props: BaseToastProps) => <ErrorToast {...props} />,
    info: (props: BaseToastProps) => <InfoToast {...props} />,
  }

  return (
    <NavigationContainer {...props} ref={ref}>
      <RootStack navigationRef={ref} />
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
