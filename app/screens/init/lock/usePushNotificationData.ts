import { Linking } from "react-native"
import { CommonActions, useNavigation } from "@react-navigation/native"

import { AppScreenProps } from "@/navigators"
import { NotifeeNotificationData, PushEvent } from "@/utils/pushNotification"
import { AppStorageKey, load, remove } from "@/utils/storage"

export const usePushNotifionData = () => {
  const navigation = useNavigation<AppScreenProps<"lock">["navigation"]>()

  /**
   * Land on a share list with a valid back stack. Navigating straight to the
   * leaf would seed shareStack with only that route (no initialRouteName), so
   * the header back arrow has nothing to pop ("no route to go back"). Instead
   * we rebuild the same state the normal flow produces:
   *   authStack[ mainTab(browseTab), browseStack[ shareStack[ sharesHome, leaf ] ] ]
   * so back goes leaf -> sharesHome -> Browse tab.
   */
  const resetToShareList = (leaf: "sharedWithYouCipherList" | "yourShareCipherList") => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "authStack",
            state: {
              index: 1,
              routes: [
                { name: "mainTab", params: { screen: "browseTab" } },
                {
                  name: "browseStack",
                  state: {
                    index: 0,
                    routes: [
                      {
                        name: "shareStack",
                        state: {
                          index: 1,
                          routes: [{ name: "sharesHome" }, { name: leaf }],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      })
    )
  }

  // Parse storage push notification data
  const parsePushNotiDataAndNavigateToTargetScreen = () => {
    let result = false
    const data = load<NotifeeNotificationData>(AppStorageKey.PUSH_NOTI_DATA)
    if (data) {
      switch (data.type) {
        case PushEvent.SHARE_NEW:
          resetToShareList("sharedWithYouCipherList")
          result = true
          break
        case PushEvent.SHARE_CONFIRM:
        case PushEvent.SHARE_ACCEPT:
        case PushEvent.SHARE_REJECT:
          resetToShareList("yourShareCipherList")
          result = true
          break
        case PushEvent.EMERGENCY_INVITE:
        case PushEvent.EMERGENCY_ACCEPT_INVITATION:
        case PushEvent.EMERGENCY_REJECT_INVITATION:
        case PushEvent.EMERGENCY_INITIATE:
        case PushEvent.EMERGENCY_APPROVE_REQUEST:
        case PushEvent.EMERGENCY_REJECT_REQUEST:
          navigation.replace("authStack", {
            screen: "mainTab",
            params: {
              screen: "homeTab",
            },
          })
          result = true
          break
        case PushEvent.TIP_TRICK:
          navigation.replace("authStack", {
            screen: "mainTab",
            params: {
              screen: "homeTab",
            },
          })
          if (data.url) {
            Linking.canOpenURL(data.url).then((canOpen) => {
              if (canOpen && data.url) {
                Linking.openURL(data.url)
              }
            })
          }
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
