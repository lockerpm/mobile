import { AuthScreenProps } from "@/navigators"
import { CipherAppView } from "@/static/types"
import { delay } from "@/utils/delay"
import { useNavigation } from "@react-navigation/native"
import { useCallback } from "react"
import { Platform } from "react-native"

export const useActionsNavigate = (item: CipherAppView, onClose: () => void) => {
  const navigation = useNavigation<AuthScreenProps<"cipherActionsModal">["navigation"]>()

  const navigateManageSharedMembers = useCallback(() => {
    if (Platform.OS === "ios") {
      navigation.replace("browseStack", {
        screen: "shareStack",
        params: {
          screen: "manageSharedMember",
          params: {
            cipher: item,
          },
        },
      })
      return
    }
    onClose()
    delay(30).then(() => {
      navigation.navigate("browseStack", {
        screen: "shareStack",
        params: {
          screen: "manageSharedMember",
          params: {
            cipher: item,
          },
        },
      })
    })
  }, [])
  const navigateQuickShare = useCallback(() => {
    if (Platform.OS === "ios") {
      navigation.replace("browseStack", {
        screen: "shareStack",
        params: {
          screen: "quickShares",
          params: {
            cipher: item,
          },
        },
      })
      return
    }
    onClose()
    delay(30).then(() => {
      navigation.navigate("browseStack", {
        screen: "shareStack",
        params: {
          screen: "quickShares",
          params: {
            cipher: item,
          },
        },
      })
    })
  }, [])

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

  const navigateCipherClone = useCallback(() => {
    if (Platform.OS === "ios") {
      navigation.replace("browseStack", {
        screen: "cipherEdit",
        params: {
          mode: "clone",
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
          mode: "clone",
          cipherType: item.type,
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

  const navigateAttachment = useCallback((isShared?: boolean) => {
    if (Platform.OS === "ios") {
      navigation.replace("browseStack", {
        screen: "attachment",
        params: {
          isShared,
          cipher: item,
        },
      })
      return
    }
    onClose()
    delay(30).then(() => {
      navigation.navigate("browseStack", {
        screen: "attachment",
        params: {
          isShared,
          cipher: item,
        },
      })
    })
  }, [])

  const navigateMoveToFolder = useCallback(() => {
    const initialId =
      item.folderId || (item.collectionIds.length > 0 ? item.collectionIds[0] : undefined)
    if (Platform.OS === "ios") {
      navigation.replace("browseStack", {
        screen: "folderSelect",
        params: {
          mode: "move",
          initialId: initialId,
          cipherIds: [item.id],
        },
      })
      return
    }
    onClose()
    delay(30).then(() => {
      navigation.navigate("browseStack", {
        screen: "folderSelect",
        params: {
          mode: "move",
          initialId: initialId,
          cipherIds: [item.id],
        },
      })
    })
  }, [item])

  return {
    navigateManageSharedMembers,
    navigateQuickShare,
    navigateHistory,
    navigateCipherDetail,
    navigateCipherClone,
    navigateCipherEdit,
    navigateAttachment,
    navigateMoveToFolder,
  }
}
