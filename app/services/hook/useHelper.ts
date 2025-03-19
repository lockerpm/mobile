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
import { MASTER_PW_MIN_LENGTH } from "app/static/constants"
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
  const randomString = (size?: number) => {
    return nanoid(size)
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
  const notifyApiError = (problem: GeneralApiProblem, disableToast?: boolean) => {
    let errorMessage = ""
    switch (problem.kind) {
      case "cannot-connect":
        errorMessage = translate("error.cannot_connect")
        break
      case "network-error":
        errorMessage = translate("error.network_error")
        break
      case "bad-data":
      case "rejected":
        errorMessage = translate("error.invalid_data")
        break
      case "forbidden":
        errorMessage = translate("error.forbidden")
        break
      case "not-found":
        errorMessage = translate("error.not_found")
        break
      case "unauthorized":
        errorMessage = translate("error.token_expired")
        break
      case "timeout":
        errorMessage = translate("error.network_timeout")
        break

      case "server":
        errorMessage = translate("error.server_error")
        break
      default:
        errorMessage = translate("error.something_went_wrong")
    }

    if ("data" in problem) {
      const errorData: {
        details?: {
          [key: string]: string[]
        }
        code:
          | "0000"
          | "0002"
          | "0004"
          | "0005"
          | "0008"
          | "0009"
          | "1001"
          | "1002"
          | "1003"
          | "1004"
          | "1005"
          | "1006"
          | "1007"
          | "1008"
          | "1009"
          | "1010"
          | "1011"
          | "1012"
          | "3003"
          | "3005"
          | "5000"
          | "5001"
          | "5002"
          | "7002"
          | "7003"
          | "7004"
          | "7005"
          | "7006"
          | "7007"
          | "7008"
          | "7009"
          | "7010"
          | "7011"
          | "7012"
          | "7013"
          | "7014"
          | "7015"
          | "7016"
          | "7017"
          | "7018"
          | "7019"
          | "8000"
          | "8001"
          | "9000"
          | "10000"
        message?: string
      } = problem.data
      if (errorData.code === "0004") {
        // if invalid data, try parse details error
        const keys = Object.keys(errorData.details)
        if (keys.length > 0 && errorData.details[keys[0]].length > 0) {
          errorMessage = errorData.details[keys[0]][0]
        } else {
          errorMessage = translate("error.something_went_wrong")
        }
      } else {
        errorMessage =
          translate(`error.api.${errorData.code}`) || translate("error.something_went_wrong")
      }
    }
    if (disableToast) {
      return errorMessage
    }
    notify("error", errorMessage)
    return ""
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
          res.path = "mainStack"
          res.params = {
            screen: "mainTab",
            params: {
              screen: "browseTab",
              params: {
                screen: "sharedItems",
              },
            },
          }
          res.tempParams = {
            screen: "mainTab",
            params: {
              screen: "browseTab",
            },
          }
          break
        case PushEvent.SHARE_CONFIRM:
        case PushEvent.SHARE_ACCEPT:
        case PushEvent.SHARE_REJECT:
          res.path = "mainStack"
          res.params = {
            screen: "mainTab",
            params: {
              screen: "browseTab",
              params: {
                screen: "shareItems",
              },
            },
          }
          res.tempParams = {
            screen: "mainTab",
            params: {
              screen: "browseTab",
            },
          }
          break

        case PushEvent.EMERGENCY_INVITE:
        case PushEvent.EMERGENCY_REJECT_REQUEST:
        case PushEvent.EMERGENCY_APPROVE_REQUEST:
          res.path = "mainStack"
          res.params = {
            screen: "contactsTrustedYou",
          }
          break
        case PushEvent.EMERGENCY_INITIATE:
        case PushEvent.EMERGENCY_ACCEPT_INVITATION:
        case PushEvent.EMERGENCY_REJECT_INVITATION:
          res.path = "mainStack"
          res.params = {
            screen: "yourTrustedContact",
          }
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
