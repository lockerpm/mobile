import { useNavigation } from "@react-navigation/native"

import { AppScreenProps } from "@/navigators"
import { NotifeeNotificationData, PushEvent } from "@/utils/pushNotification"
import { AppStorageKey, load, remove } from "@/utils/storage"

export const usePushNotifionData = () => {
  const navigation = useNavigation<AppScreenProps<"lock">["navigation"]>()

  // Parse storage push notification data
  const parsePushNotiDataAndNavigateToTargetScreen = () => {
    let result = false
    const data = load<NotifeeNotificationData>(AppStorageKey.PUSH_NOTI_DATA)
    if (data) {
      switch (data.type) {
        case PushEvent.SHARE_NEW:
          navigation.replace("authStack", {
            screen: "mainTab",
            params: {
              screen: "homeTab",
            },
          })
          navigation.navigate("authStack", {
            screen: "browseStack",
            params: {
              screen: "shareStack",
              params: {
                screen: "sharedWithYouCipherList",
              },
            },
          })
          result = true
          break
        case PushEvent.SHARE_CONFIRM:
        case PushEvent.SHARE_ACCEPT:
        case PushEvent.SHARE_REJECT:
          navigation.replace("authStack", {
            screen: "mainTab",
            params: {
              screen: "homeTab",
            },
          })
          navigation.navigate("authStack", {
            screen: "browseStack",
            params: {
              screen: "shareStack",
              params: {
                screen: "yourShareCipherList",
              },
            },
          })
          result = true
          break
      }
      remove(AppStorageKey.PUSH_NOTI_DATA)
      return result
    }
    return false
  }

  return {
    parsePushNotiDataAndNavigateToTargetScreen,
  }
}
