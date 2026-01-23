import { useEffect } from "react"
import { Linking } from "react-native"
import { CommonActions, NavigationProp, useNavigation } from "@react-navigation/native"

import { LockType } from "@/static/types"

import { AppRoute } from "./navigators.types"

export const useLiveOtpAuthDeeplinkHandler = () => {
  const navigation = useNavigation<NavigationProp<AppRoute>>()

  useEffect(() => {
    const handleOtpAuthDeeplink = (event: { url: string }) => {
      const url = event.url
      if (url.startsWith("otpauth://")) {
        try {
          // Reset navigation stack and navigate to LockScreen with the label param
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "lock",
                  params: {
                    type: LockType.Individual,
                    temporaryLock: false,
                    label: url,
                  },
                },
              ],
            })
          )
        } catch (error) {
          console.error("Invalid otpauth URL:", error)
        }
      }
    }

    // Add event listener for deep links
    const subscription = Linking.addEventListener("url", handleOtpAuthDeeplink)

    return () => {
      // Clean up the event listener
      subscription.remove()
    }
  }, [navigation])
}
