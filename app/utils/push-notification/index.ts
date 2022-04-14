import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import notifee, { Notification, EventType, Event, AndroidLaunchActivityFlag } from '@notifee/react-native'
import { IS_IOS } from '../../config/constants'
import { Logger } from '../logger'
import { NotifeeNotificationData, PushEvent } from './types';
import { load, save, StorageKey } from '../storage';
import { handleNewShare, handleConfirmShare } from './handler';


export class PushNotifier {
  constructor () {}

  // Request permission
  static async getPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    return enabled
  }

  // Get FCM token
  static async getToken() {
    if (!IS_IOS) {
      await messaging().registerDeviceForRemoteMessages()
    }
    const token = await messaging().getToken()
    return token
  }

  // Forground handler
  static setupForegroundHandler(params: {
    handleForegroundPress: (data: NotifeeNotificationData) => Promise<void>
  }) {
    const { handleForegroundPress } = params

    // Firebase
    messaging().onMessage(async (message: FirebaseMessagingTypes.RemoteMessage) => {
      Logger.debug('Firebase: FOREGROUND HANDLER')

      const { event, data } = message.data
      switch (event) {
        case PushEvent.SHARE_NEW: {
          await handleNewShare(data)
          break
        }

        case PushEvent.SHARE_CONFIRM:
          await handleConfirmShare(data)
          break

        default:
          Logger.debug('Unknow FCM event: ' + JSON.stringify(message))
      }
    })

    // Notifee - Handle user interaction with notification here
    return notifee.onForegroundEvent((event: Event) => {
      Logger.debug('Notifee: FOREGROUND HANDLER')

      const { detail, type } = event

      if (type === EventType.PRESS) {
        handleForegroundPress(detail.notification.data)
      }
    })
  }

  // Background handler
  static setupBackgroundHandler() {
    // Firebase
    messaging().setBackgroundMessageHandler(async (message: FirebaseMessagingTypes.RemoteMessage) => {
      Logger.debug('Firebase: BACKGROUND HANDLER')

      const currentUser = await load(StorageKey.APP_CURRENT_USER)
      if (!currentUser) {
        return
      }
      
      const { event, data } = message.data

      switch (event) {
        case PushEvent.SHARE_NEW: {
          await handleNewShare(data)
          break
        }

        case PushEvent.SHARE_CONFIRM:
          await handleConfirmShare(data)
          break
          
        default:
          Logger.debug('Unknow FCM event: ' + JSON.stringify(message))
      }
    })

    // Notifee
    notifee.onBackgroundEvent(async (event: Event) => {
      // Handle user interaction with notification here
      Logger.debug('BACKGROUND HANDLER NOTIFEE')
      const { type, detail } = event
      if (type === EventType.PRESS) {
        const data: NotifeeNotificationData = detail.notification.data
        if (!data) {
          return
        }

        switch (data.type) {
          case PushEvent.SHARE_NEW:
            save(StorageKey.PUSH_NOTI_DATA, {
              type: PushEvent.SHARE_NEW
            })
            break
          case PushEvent.SHARE_CONFIRM:
            save(StorageKey.PUSH_NOTI_DATA, {
              type: PushEvent.SHARE_CONFIRM
            })
            break
        } 
      }      
    })
  }

  // Cancel notification
  static cancelNotification(id: string) {
    return notifee.cancelNotification(id)
  }

  // Display push notification
  static async _notify(data: Notification) {
    // Create a channel
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    })

    // Display a notification
    await notifee.displayNotification({
      ...data,
      android: {
        channelId,
        pressAction: {
          launchActivity: "default",
          id: "default",
          launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP]
        },
        smallIcon: 'locker_small',
        color: '#268334'
      }
    })
  }
}
