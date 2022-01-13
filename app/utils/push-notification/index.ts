import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import notifee, { Notification, EventType, Event } from '@notifee/react-native'
import { IS_IOS } from '../../config/constants'
import { load, storageKeys } from '../storage'
import { Logger } from '../logger'


type NotifeeNotificationData = {
  type?: 'new_message'
  source?: string
}


export class PushNotifier {
  constructor () {}

  static async getPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    return enabled
  }

  static async getToken() {
    if (!IS_IOS) {
      await messaging().registerDeviceForRemoteMessages()
    }
    const token = await messaging().getToken()
    return token
  }

  static setupForegroundHandler() {
    // Firebase
    messaging().onMessage((message: FirebaseMessagingTypes.RemoteMessage) => {
      Logger.debug('Firebase: FOREGROUND HANDLER')

      const { event } = message.data
      switch (event) {
        case 'new_message':
          // Handled in socket -> dismiss
          break
        default:
          Logger.debug('Unknow FCM event: ' + JSON.stringify(message))
      }
    })

    // Notifee - Handle user interaction with notification here
    return notifee.onForegroundEvent((event: Event) => {
      Logger.debug('Notifee: FOREGROUND HANDLER')

      const { detail } = event
      const data: NotifeeNotificationData = detail.notification.data
      if (!data) {
        return
      }

      switch (data.type) {
        case 'new_message': {
          // Handled in socket -> dismiss
          break
        }
      }
    })
  }

  static setupBackgroundHandler() {
    // Firebase
    messaging().setBackgroundMessageHandler(async (message: FirebaseMessagingTypes.RemoteMessage) => {
      Logger.debug('Firebase: BACKGROUND HANDLER')
      
      const { event } = message.data
      switch (event) {
        case 'new_message': {
          const account: {
            language: 'en' | 'vi'
          } = await load(storageKeys.APP_CURRENT_USER)
          if (!account) {
            return
          }
          break
        }
          
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
          case 'new_message': {
            break
          }
        } 
      }      
    })
  }

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
          id: "default"
        }
      }
    })
  }
}
