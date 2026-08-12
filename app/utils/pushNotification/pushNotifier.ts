// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, Platform } from "react-native"
import {
  getMessaging,
  requestPermission,
  FirebaseMessagingTypes,
  registerDeviceForRemoteMessages,
  getToken,
  hasPermission,
  AuthorizationStatus,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from "@react-native-firebase/messaging"

import { NotifeeNotificationData, PushEvent } from "./types"
import { Logger } from "../logger"
import { AppStorageKey, save } from "../storage"

const IS_IOS = Platform.OS === "ios"
const messaging = getMessaging()

/**
 * Normalise an FCM remote-message `data` payload ({ event, data, url }) into the
 * NotifeeNotificationData shape the lock screen consumer (usePushNotifionData)
 * expects, so tap-routing reads a single stable structure from PUSH_NOTI_DATA.
 */
const toPushNotiData = (data?: { [key: string]: unknown }): NotifeeNotificationData | null => {
  if (!data) return null
  const type = (data.type ?? data.event) as PushEvent | undefined
  if (!type) return null
  return {
    type,
    url: typeof data.url === "string" ? data.url : undefined,
  }
}

const savePushNotiData = (data?: { [key: string]: unknown }) => {
  const notiData = toPushNotiData(data)
  if (notiData) {
    save(AppStorageKey.PUSH_NOTI_DATA, notiData)
  }
}

export class PushNotifier {
  // Request permission
  static async checkPermission() {
    if (IS_IOS) {
      const authStatus = await hasPermission(messaging)
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL
      return enabled
    }

    if (Platform.OS === "android") {
      const authStatus = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      )
      return authStatus
    }
    return false
  }

  static async getPermission() {
    if (Platform.OS === "ios") {
      const authStatus = await requestPermission(messaging)
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL
      return enabled
    }

    if (Platform.OS === "android") {
      const authStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      )
      return authStatus === PermissionsAndroid.RESULTS.GRANTED
    }
    return false
  }

  // Get FCM token
  static async getToken() {
    if (!IS_IOS) {
      await registerDeviceForRemoteMessages(messaging)
    }
    const token = await getToken(messaging)
    return token
  }

  // Foreground FCM messages. The server sends a `notification` field, which the
  // OS does NOT auto-display while the app is foregrounded — so the caller (the
  // hook) shows an in-app Toast from message.notification. Returns unsubscribe.
  static onForegroundMessage(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void) {
    return onMessage(messaging, async (message) => {
      Logger.debug("Firebase: FOREGROUND MESSAGE")
      Logger.debug(message.data)
      callback(message)
    })
  }

  // User tapped an OS-displayed alert (FCM `notification` payload) that opened
  // the app from the background. Persist for tap-routing. Returns unsubscribe.
  static setupNotificationOpenHandler() {
    return onNotificationOpenedApp(messaging, (message) => {
      Logger.debug("Firebase: NOTIFICATION OPENED")
      savePushNotiData(message?.data)
    })
  }

  // App launched from a quit state by tapping an OS-displayed alert. Persist for
  // tap-routing. Call once on startup.
  static async checkInitialNotification() {
    const message = await getInitialNotification(messaging)
    if (message) {
      Logger.debug("Firebase: INITIAL NOTIFICATION")
      savePushNotiData(message.data)
    }
  }
}
