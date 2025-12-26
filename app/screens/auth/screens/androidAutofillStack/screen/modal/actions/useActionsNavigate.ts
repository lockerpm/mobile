import { useCallback } from "react"
import { Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { AuthScreenProps } from "@/navigators"
import { CipherAppView } from "@/static/types"
import { delay } from "@/utils/delay"

export const useActionsNavigate = (item: CipherAppView, onClose: () => void) => {
  const navigation = useNavigation<AuthScreenProps<"cipherActionsModal">["navigation"]>()

  const navigateHistory = useCallback(() => {
    if (Platform.OS === "ios") {
      navigation.replace("browseStack", {
        screen: "passwordsHistory",
        params: {
          cipher: item,
        },
      })
      return
    }
    onClose()
    delay(30).then(() => {
      navigation.navigate("browseStack", {
        screen: "passwordsHistory",
        params: {
          cipher: item,
        },
      })
    })
  }, [])

  const navigateCipherDetail = useCallback(() => {
    if (Platform.OS === "ios") {
      navigation.replace("browseStack", {
        screen: "cipherDetail",
        params: {
          cipher: item,
        },
      })
      return
    }
    onClose()
    delay(30).then(() => {
      navigation.navigate("browseStack", {
        screen: "cipherDetail",
        params: {
          cipher: item,
        },
      })
    })
  }, [])

  const navigateCipherEdit = useCallback(() => {
    if (Platform.OS === "ios") {
      navigation.replace("browseStack", {
        screen: "cipherEdit",
        params: {
          mode: "edit",
          cipherType: item.type,
          cipher: item,
        },
      })
      return
    }
    onClose()
    delay(30).then(() => {
      navigation.navigate("browseStack", {
        screen: "cipherEdit",
        params: {
          mode: "edit",
          cipherType: item.type,
          cipher: item,
        },
      })
    })
  }, [])

  return {
    navigateHistory,
    navigateCipherDetail,
    navigateCipherEdit,
  }
}
