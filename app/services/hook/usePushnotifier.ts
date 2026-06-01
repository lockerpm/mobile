import { useStores } from "@/models"
import { Logger } from "@/utils/logger"
import { PushNotifier } from "@/utils/pushNotification"

export const usePushNotifier = () => {
  const { user } = useStores()
  // Setup push notifier
  const requestPermission = async () => {
    try {
      if (user.haveRequestedPushPermission) {
        return
      }
      await PushNotifier.getPermission()
      user.setHaveRequestedPushPermission(true)
    } catch (e) {
      Logger.error("request push Permission: " + e)
    }
  }

  const boostrapPushNotifier = async () => {
    try {
      if (user.disablePushNotifications) {
        return null
      }
      const permissionGranted = await PushNotifier.checkPermission()
      if (permissionGranted) {
        const token = await PushNotifier.getToken()
        return token
      }
      return null
    } catch (e) {
      Logger.error("boostrapPushNotifier: " + e)
      return null
    }
  }

  return {
    requestPermission,
    boostrapPushNotifier,
  }
}
