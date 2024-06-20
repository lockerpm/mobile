import { useCoreService } from "../coreService"
import find from "lodash/find"
import { nanoid } from "nanoid"
import { useStores } from "app/models"
import { PushNotiData, StorageKey, load, remove } from "app/utils/storage"
import { PushNotifier } from "app/utils/pushNotification"
import { Logger } from "app/utils/utils"
import Toast from "react-native-toast-message"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Clipboard from "@react-native-clipboard/clipboard"
import ReactNativeBiometrics from "react-native-biometrics"
import { MASTER_PW_MIN_LENGTH, MAX_CIPHER_SELECTION } from "app/static/constants"
import { GeneralApiProblem } from "../api/apiProblem"
import { NotifeeNotificationData, PushEvent } from "app/utils/pushNotification/types"
import { translate as tl, TxKeyPath } from "../../i18n"
import i18n from "i18n-js"

export function useHelper() {
  const { user, cipherStore, collectionStore, folderStore, toolStore, enterpriseStore } =
    useStores()
  const { userService } = useCoreService()
  const insets = useSafeAreaInsets()

  const translate = (tx: TxKeyPath, options?: i18n.TranslateOptions) => {
    // Dummy to force rerender
    const _abc = user.language
    return tl(tx, options)
  }

  // Alert message
  const notify = (
    type: "error" | "success" | "info",
    text: null | string,
    duration?: undefined | number,
  ) => {
    Toast.show({
      type,
      text2: text,
      position: "top",
      autoHide: true,
      visibilityTime: duration || (type === "error" ? 3000 : 2000),
      topOffset: insets.top + 10,
      onPress: () => {
        Toast.hide()
      },
    })
  }

  // Random string
  const randomString = () => {
    return nanoid()
  }

  // Clipboard
  const copyToClipboard = (text: string) => {
    notify("success", translate("common.copied_to_clipboard"), 1000)
    Clipboard.setString(text)
  }

  // Set tokens
  const setApiTokens = (token: string) => {
    user.setApiToken(token)
    cipherStore.setApiToken(token)
    collectionStore.setApiToken(token)
    folderStore.setApiToken(token)
    toolStore.setApiToken(token)
    enterpriseStore.setApiToken(token)
  }

  // Get current route name
  const getRouteName = async () => {
    const res = await load("NAVIGATION_STATE")
    let route = res.routes.slice(-1)[0]
    while (route.state && route.state.routes) {
      route = route.state.routes.slice(-1)[0]
    }
    return route.name
  }

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
        return true
      } else {
        user.setFCMToken(null)
        return true
      }
    } catch (e) {
      Logger.error("boostrapPushNotifier: " + e)
      return false
    }
  }

  // Get all org
  const getAllOrganizations = () => {
    return userService.getAllOrganizations()
  }

  // Get team
  const getTeam = (teams: any[], orgId: string) => {
    return find(teams, (e) => e.id === orgId) || { name: "", role: "", type: 0 }
  }

  // Check if biometric is viable
  const isBiometricAvailable = async () => {
    try {
      const { available } = await ReactNativeBiometrics.isSensorAvailable()
      return available
    } catch (e) {
      notify("error", translate("error.something_went_wrong"))
      Logger.error("isBiometricAvailable: " + e)
      return false
    }
  }

  // Notify based on api error
  const notifyApiError = async (problem: GeneralApiProblem) => {
    switch (problem.kind) {
      case "cannot-connect":
        notify("error", translate("error.cannot_connect"))
        break

      case "network-error":
        notify("error", translate("error.network_error"))
        break

      case "rejected":
        notify("error", translate("error.invalid_data"))
        break

      case "bad-data": {
        notify("error", translate("error.invalid_data"))
        break
      }

      case "forbidden":
        notify("error", translate("error.forbidden"))
        break

      case "not-found":
        notify("error", translate("error.not_found"))
        break

      case "unauthorized":
        notify("error", translate("error.token_expired"))
        break

      case "timeout":
        notify("error", translate("error.network_timeout"))
        break

      case "server":
        notify("error", translate("error.server_error"))
        break

      default:
        notify("error", translate("error.something_went_wrong"))
    }

    if ("data" in problem) {
      const errorData: {
        details?: {
          [key: string]: string[]
        }
        code: string
        message?: string
      } = problem.data
      if (errorData.code === "5001") {
        notify(
          "error",
          translate("error.cannot_update_more_at_once", { count: MAX_CIPHER_SELECTION }),
        )
      }

      switch (errorData.code) {
        case "0000": {
          notify("error", translate("error.api.0000"))
          break
        }
        case "0002": {
          notify("error", translate("error.api.0002"))
          break
        }
        case "0004": {
          notify("error", translate("error.api.0004"))
          break
        }
        case "0005": {
          notify("error", translate("error.api.0005"))
          break
        }
        case "0008": {
          notify("error", translate("error.api.0008"))
          break
        }
        case "0009": {
          notify("error", translate("error.api.0009"))
          break
        }
        case "1001": {
          notify("error", translate("error.api.1001"))
          break
        }
        case "1002": {
          notify("error", translate("error.api.1002"))
          break
        }
        case "1003": {
          notify("error", translate("error.api.1003"))
          break
        }
        case "1004": {
          notify("error", translate("error.api.1004"))
          break
        }
        case "1005": {
          notify("error", translate("error.api.1005"))
          break
        }
        case "1006": {
          notify("error", translate("error.api.1006"))
          break
        }
        case "1007": {
          notify("error", translate("error.api.1007"))
          break
        }
        case "1008": {
          notify("error", translate("error.api.1008"))
          break
        }
        case "1009": {
          notify("error", translate("error.api.1009"))
          break
        }
        case "1010": {
          notify("error", translate("error.api.1010"))
          break
        }
        case "1011": {
          notify("error", translate("error.api.1011"))
          break
        }
        case "1012": {
          notify("error", translate("error.api.1012"))
          break
        }
        case "3003": {
          notify("error", translate("error.api.3003"))
          break
        }
        case "3005": {
          notify("error", translate("error.api.3005"))
          break
        }
        case "5000": {
          notify("error", translate("error.api.5000"))
          break
        }
        case "5001": {
          notify("error", translate("error.api.5001"))
          break
        }
        case "5002": {
          notify("error", translate("error.api.5002"))
          break
        }
        case "7002": {
          notify("error", translate("error.api.7002"))
          break
        }
        case "7003": {
          notify("error", translate("error.api.7003"))
          break
        }
        case "7004": {
          notify("error", translate("error.api.7004"))
          break
        }
        case "7005": {
          notify("error", translate("error.api.7005"))
          break
        }
        case "7006": {
          notify("error", translate("error.api.7006"))
          break
        }
        case "7007": {
          notify("error", translate("error.api.7007"))
          break
        }
        case "7008": {
          notify("error", translate("error.api.7008"))
          break
        }
        case "7009": {
          notify("error", translate("error.api.7009"))
          break
        }
        case "7010": {
          notify("error", translate("error.api.7010"))
          break
        }
        case "7011": {
          notify("error", translate("error.api.7011"))
          break
        }
        case "7012": {
          notify("error", translate("error.api.7012"))
          break
        }
        case "7013": {
          notify("error", translate("error.api.7013"))
          break
        }
        case "7014": {
          notify("error", translate("error.api.7014"))
          break
        } 
        case "7015": {
          notify("error", translate("error.api.7015"))
          break
        }
        case "7016": {
          notify("error", translate("error.api.7016"))
          break
        }
        case "7017": {
          notify("error", translate("error.api.7017"))
          break
        }
        case "7018": {
          notify("error", translate("error.api.7018"))
          break
        }
        case "7019": {
          notify("error", translate("error.api.7019"))
          break
        }
        case "8000": {
          notify("error", translate("error.api.8000"))
          break
        }
        case "8001": {
          notify("error", translate("error.api.8001"))
          break
        }
        case "9000": {
          notify("error", translate("error.api.9000"))
          break
        }
        case "10000": {
          notify("error", translate("error.api.10000"))
          break
        }

      }
    }
  }

  // Parse storage push notification data
  const parsePushNotiData = async (params?: {
    notifeeData?: NotifeeNotificationData
    tipTrick?: boolean
  }) => {
    const { notifeeData, tipTrick } = params || {}
    const res = {
      path: "",
      params: {},
      tempParams: {},
      url: "",
    }
    let data: PushNotiData | NotifeeNotificationData = notifeeData
    if (!data) {
      data = await load(StorageKey.PUSH_NOTI_DATA)
    }
    if (data) {
      switch (data.type) {
        case PushEvent.SHARE_NEW:
          res.path = "mainTab"
          res.params = {
            screen: "browseTab",
            params: {
              screen: "sharedItems",
            },
          }
          res.tempParams = {
            screen: "browseTab",
          }
          break
        case PushEvent.SHARE_CONFIRM:
        case PushEvent.SHARE_ACCEPT:
        case PushEvent.SHARE_REJECT:
          res.path = "mainTab"
          res.params = {
            screen: "browseTab",
            params: {
              screen: "shareItems",
            },
          }
          res.tempParams = {
            screen: "browseTab",
          }
          break

        case PushEvent.EMERGENCY_INVITE:
        case PushEvent.EMERGENCY_REJECT_REQUEST:
        case PushEvent.EMERGENCY_APPROVE_REQUEST:
          res.path = "contactsTrustedYou"
          break
        case PushEvent.EMERGENCY_INITIATE:
        case PushEvent.EMERGENCY_ACCEPT_INVITATION:
        case PushEvent.EMERGENCY_REJECT_INVITATION:
          res.path = "yourTrustedContact"
          break
        case PushEvent.TIP_TRICK:
          res.url = data.url
      }
      if (data.type !== PushEvent.TIP_TRICK || (tipTrick && data.type === PushEvent.TIP_TRICK)) {
        await remove(StorageKey.PUSH_NOTI_DATA)
      }
    }
    return res
  }
  // Validate master password
  const validateMasterPassword = (password: string) => {
    let isValid = true
    let error = ""

    if (password.length && password.length < MASTER_PW_MIN_LENGTH) {
      isValid = false
      error = translate("policy.min_password_length", { length: MASTER_PW_MIN_LENGTH })
    }

    return {
      isValid,
      error,
    }
  }

  return {
    translate,
    setApiTokens,
    notify,
    randomString,
    getAllOrganizations,
    getTeam,
    copyToClipboard,
    getRouteName,
    isBiometricAvailable,
    notifyApiError,
    boostrapPushNotifier,
    parsePushNotiData,
    validateMasterPassword,
  }
}
