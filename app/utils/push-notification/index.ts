import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import notifee, { Notification, EventType, Event } from '@notifee/react-native'
import { IS_IOS } from '../../config/constants'
import { Logger } from '../logger'
import { ConfirmShareData, NewShareData, NotifeeNotificationData, PushEvent } from './types';
import { load, storageKeys } from '../storage';
import { CipherType } from '../../../core/enums';


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
  static setupForegroundHandler() {
    // Firebase
    messaging().onMessage((message: FirebaseMessagingTypes.RemoteMessage) => {
      Logger.debug('Firebase: FOREGROUND HANDLER')

      const { event } = message.data
      switch (event) {
        case PushEvent.SHARE_NEW:
        case PushEvent.SHARE_CONFIRM:
          // Do nothing on foreground
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
        case PushEvent.SHARE_NEW:
        case PushEvent.SHARE_CONFIRM:
          // Do nothing on foreground
          break
      }
    })
  }

  // Background handler
  static setupBackgroundHandler() {
    // Firebase
    messaging().setBackgroundMessageHandler(async (message: FirebaseMessagingTypes.RemoteMessage) => {
      Logger.debug('Firebase: BACKGROUND HANDLER')

      const currentUser = await load(storageKeys.APP_CURRENT_USER)
      if (!currentUser) {
        return
      }
      
      const { language, pwd_user_id } = currentUser
      const { event, data } = message.data
      const isVn = language === 'vi'

      switch (event) {
        case PushEvent.SHARE_NEW: {
          const shareData: NewShareData = JSON.parse(data)

          // Only noti current user
          if (!shareData.pwd_user_ids.map(i => i.toString()).includes(pwd_user_id)) {
            return
          }

          if (shareData.count) {
            PushNotifier._notify({
              id: `share_new`,
              title: isVn ? 'Locker' : 'Locker',
              body: isVn ? `Bạn đã được chia sẻ ${shareData.count} mục. Vào Locker để chấp nhận hoặc từ chối.` : `You have ${shareData.count} new shared items. Open Locker to accept or reject.`,
              data: {
                type: PushEvent.SHARE_NEW
              }
            })
            return
          }

          let typeName = isVn ? 'mục' : 'item'
          switch (shareData.share_type) {
            case CipherType.Card:
              typeName = isVn ? 'thẻ tín dụng' : 'card'
              break
            case CipherType.CryptoAccount:
              typeName = isVn ? 'tài khoản crypto' : 'crypto account'
              break
            case CipherType.CryptoWallet:
              typeName = isVn ? 'ví crypto' : 'crypto wallet'
              break
            case CipherType.Identity:
              typeName = isVn ? 'danh tính' : 'identity'
              break
            case CipherType.Login:
              typeName = isVn ? 'mật khẩu' : 'password'
              break
            case CipherType.SecureNote:
              typeName = isVn ? 'ghi chú' : 'note'
              break
          }

          PushNotifier._notify({
            id: `share_new`,
            title: isVn ? 'Locker' : 'Locker',
            body: isVn ? `Bạn đã được chia sẻ một ${typeName}` : `You have a new shared ${typeName}`,
            data: {
              type: PushEvent.SHARE_NEW
            }
          })
          return
        }

        case PushEvent.SHARE_CONFIRM:
          const shareData: ConfirmShareData = JSON.parse(data)

          // Only noti current user
          if (!shareData.pwd_user_ids.map(i => i.toString()).includes(pwd_user_id)) {
            return
          }

          PushNotifier._notify({
            id: `share_confirm`,
            title: isVn ? 'Locker' : 'Locker',
            body: isVn ? `Vui lòng xác nhận yêu cầu chia sẻ của bạn` : `Please confirm your sharing request`,
            data: {
              type: PushEvent.SHARE_CONFIRM
            }
          })
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
            // TODO: set initial page
            break
          case PushEvent.SHARE_CONFIRM:
            // TODO: set initial page
            break
        } 
      }      
    })
  }

  // Cancel notification
  static cancelNotification(id: string) {
    return notifee.cancelNotification(id)
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
