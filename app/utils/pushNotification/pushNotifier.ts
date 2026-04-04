// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid, Platform } from "react-native"
import notifee from "@notifee/react-native"
import {
  getMessaging,
  requestPermission,
  FirebaseMessagingTypes,
  registerDeviceForRemoteMessages,
  setBackgroundMessageHandler,
  getToken,
  hasPermission,
  AuthorizationStatus,
} from "@react-native-firebase/messaging"

// import { save, AppStorageKey } from "../storage"
import {
  handleNewShare,
  handleConfirmShare,
  handleResponseShare,
  handleInviteEA,
  handleIviteResponseEA,
  handleRequestEA,
  handleRequestEAResponseEA,
  handleTipTrick,
} from "./handler"
import {
  // NotifeeNotificationData,
  PushEvent,
} from "./types"
import { Logger } from "../logger"

const IS_IOS = Platform.OS === "ios"
const messaging = getMessaging()

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
    await notifee.requestPermission()

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

  // Background handler
  static setupBackgroundHandler() {
    // Firebase
    setBackgroundMessageHandler(
      messaging,
      async (message: FirebaseMessagingTypes.RemoteMessage) => {
        Logger.debug("Firebase: BACKGROUND HANDLER")
        Logger.debug(message.data)
        if (!message.data) {
          return
        }
        const { event, data } = message.data

        switch (event) {
          case PushEvent.SHARE_NEW: {
            await handleNewShare(data)
            break
          }
          case PushEvent.SHARE_ACCEPT: {
            await handleResponseShare(data, true)
            break
          }
          case PushEvent.SHARE_REJECT: {
            await handleResponseShare(data, false)
            break
          }
          case PushEvent.SHARE_CONFIRM: {
            await handleConfirmShare(data)
            break
          }
          case PushEvent.EMERGENCY_INVITE: {
            await handleInviteEA(data)
            break
          }
          case PushEvent.EMERGENCY_ACCEPT_INVITATION: {
            await handleIviteResponseEA(data, true)
            break
          }
          case PushEvent.EMERGENCY_REJECT_INVITATION: {
            await handleIviteResponseEA(data, false)
            break
          }
          case PushEvent.EMERGENCY_INITIATE: {
            await handleRequestEA(data)
            break
          }
          case PushEvent.EMERGENCY_APPROVE_REQUEST: {
            await handleRequestEAResponseEA(data, true)
            break
          }
          case PushEvent.EMERGENCY_REJECT_REQUEST: {
            await handleRequestEAResponseEA(data, false)
            break
          }
          case PushEvent.TIP_TRICK: {
            await handleTipTrick(data)
            break
          }
          default:
            Logger.debug("Unknow FCM event: " + JSON.stringify(message))
        }
      }
    )

    // // Notifee
    // notifee.onBackgroundEvent(async (event: Event) => {
    //   // Handle user interaction with notification here
    //   Logger.debug("BACKGROUND HANDLER NOTIFEE: ", event.detail.notification?.data)
    //   const { type, detail } = event
    //   if (type === EventType.PRESS) {
    //     Logger.debug("BACKGROUND HANDLER NOTIFEE: 1")
    //     const data: NotifeeNotificationData = detail.notification?.data as NotifeeNotificationData

    //     if (!data) {
    //       return
    //     }
    //     Logger.debug("BACKGROUND HANDLER NOTIFEE: 2")
    //     switch (data.type) {
    //       case PushEvent.SHARE_NEW:
    //       case PushEvent.SHARE_ACCEPT:
    //       case PushEvent.SHARE_REJECT:
    //       case PushEvent.SHARE_CONFIRM:
    //       case PushEvent.EMERGENCY_INVITE:
    //       case PushEvent.EMERGENCY_ACCEPT_INVITATION:
    //       case PushEvent.EMERGENCY_REJECT_INVITATION:
    //       case PushEvent.EMERGENCY_INITIATE:
    //       case PushEvent.EMERGENCY_APPROVE_REQUEST:
    //       case PushEvent.EMERGENCY_REJECT_REQUEST:
    //       case PushEvent.TIP_TRICK:
    //         save(AppStorageKey.PUSH_NOTI_DATA, data)
    //         Logger.debug("BACKGROUND HANDLER NOTIFEE: 3")
    //         break
    //     }
    //   }
    // })
  }

  // Cancel notification
  static cancelNotification(id: string) {
    return notifee.cancelNotification(id)
  }
}
