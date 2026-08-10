import { useEffect } from "react"
import { Linking } from "react-native"
import { FirebaseMessagingTypes } from "@react-native-firebase/messaging"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import Toast from "react-native-toast-message"

import { navigate, navigationRef } from "@/navigators"
import { NotifeeNotificationData, PushEvent, PushNotifier } from "@/utils/pushNotification"

/**
 * True only when the active top-level stack is the authenticated app. The user
 * must pass the lock screen every session, so we suppress the foreground toast
 * while on lock/splash/login (not unlocked or not signed in). Reads the FIRST
 * level of the root state — getActiveRouteName/getCurrentRoute recurse to the
 * leaf screen and never return "authStack".
 */
const isInAuthStack = () => {
  if (!navigationRef.isReady()) return false
  const rootState = navigationRef.getRootState()
  const topLevel = rootState?.routes[rootState.index ?? 0]?.name
  return topLevel === "authStack"
}

/**
 * Navigate straight to the screen a push event targets. Used for foreground
 * toast taps (the app is already open/unlocked), so we drive navigation via the
 * global navigationRef rather than PUSH_NOTI_DATA + the lock screen. Route
 * targets mirror usePushNotifionData (the background/quit tap path).
 */
const navigateFromPushEvent = (data: NotifeeNotificationData) => {
  switch (data.type) {
    case PushEvent.SHARE_NEW:
      navigate("authStack", {
        screen: "browseStack",
        params: { screen: "shareStack", params: { screen: "sharedWithYouCipherList" } },
      })
      break
    case PushEvent.SHARE_CONFIRM:
    case PushEvent.SHARE_ACCEPT:
    case PushEvent.SHARE_REJECT:
      navigate("authStack", {
        screen: "browseStack",
        params: { screen: "shareStack", params: { screen: "yourShareCipherList" } },
      })
      break
    case PushEvent.EMERGENCY_INVITE:
    case PushEvent.EMERGENCY_ACCEPT_INVITATION:
    case PushEvent.EMERGENCY_REJECT_INVITATION:
    case PushEvent.EMERGENCY_INITIATE:
    case PushEvent.EMERGENCY_APPROVE_REQUEST:
    case PushEvent.EMERGENCY_REJECT_REQUEST:
      navigate("authStack", { screen: "mainTab", params: { screen: "homeTab" } })
      break
    case PushEvent.TIP_TRICK:
      if (data.url) {
        Linking.canOpenURL(data.url).then((canOpen) => {
          if (canOpen && data.url) {
            Linking.openURL(data.url)
          }
        })
      }
      break
  }
}

const showForegroundToast = (message: FirebaseMessagingTypes.RemoteMessage) => {
  // Only show while the user is inside the unlocked app; skip on lock/login.
  if (!isInAuthStack()) return

  const body = message.notification?.body
  if (!body) return

  const notiData = { type: message.data?.event as PushEvent, url: message.data?.url as string }
  Toast.show({
    type: "notification",
    text1: "Locker",
    text2: body,
    position: "top",
    autoHide: true,
    topOffset: StaticSafeAreaInsets.safeAreaInsetsTop + 10,
    visibilityTime: 4000,
    onPress: () => {
      Toast.hide()
      navigateFromPushEvent(notiData)
    },
  })
}

/**
 * Registers the React-scoped push-notification listeners:
 *  - foreground FCM messages  -> in-app Toast (tap navigates directly),
 *  - notification taps that opened the app from background,
 *  - the notification that launched the app from a quit state.
 *
 * Background/quit alerts are drawn by the OS from the FCM `notification` field;
 * no background JS handler is required.
 */
export const usePushMessageHandlers = () => {
  useEffect(() => {
    const unsubscribeForeground = PushNotifier.onForegroundMessage(showForegroundToast)
    const unsubscribeNotificationOpen = PushNotifier.setupNotificationOpenHandler()

    // App launched from a quit state by tapping an OS-displayed alert.
    PushNotifier.checkInitialNotification()

    return () => {
      unsubscribeForeground()
      unsubscribeNotificationOpen()
    }
  }, [])
}
