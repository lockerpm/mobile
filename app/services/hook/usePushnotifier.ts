import { useStores } from "@/models"
import { Logger } from "@/utils/logger"
import { PushNotifier } from "@/utils/pushNotification"

export const usePushNotifier = () => {
  const { user } = useStores()
  // Setup push notifier
  const boostrapPushNotifier = async () => {
    try {
      if (user.disablePushNotifications) {
        return true
      }
      const permissionGranted = await PushNotifier.getPermission()
      if (permissionGranted) {
        const token = await PushNotifier.getToken()

        user.setFCMToken(token)
      } else {
        user.setFCMToken(null)
      }
      return true
    } catch (e) {
      Logger.error("boostrapPushNotifier: " + e)
      return false
    }
  }

  return {
    boostrapPushNotifier,
  }
}
