import { TOptions, TxKeyPath } from "app/i18n"
import Toast from "react-native-toast-message"
import { useAppLocale } from "../context"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { GeneralApiProblem } from "../api/apiProblem"

export const useToast = () => {
  const { translate } = useAppLocale()

  // Alert message
  const notify = (type: "error" | "success" | "info", text: string) => {
    Toast.show({
      type,
      text2: text,
      position: "top",
      autoHide: true,
      visibilityTime: type === "error" ? 3000 : 2000,
      topOffset: StaticSafeAreaInsets.safeAreaInsetsTop + 10,
      onPress: Toast.hide,
    })
  }

  const notifyTx = (type: "error" | "success" | "info", tx: TxKeyPath, txOptions?: TOptions) => {
    const label = translate(tx, txOptions)
    Toast.show({
      type,
      text2: label,
      position: "top",
      autoHide: true,
      visibilityTime: type === "error" ? 3000 : 2000,
      topOffset: StaticSafeAreaInsets.safeAreaInsetsTop + 10,
      onPress: Toast.hide,
    })
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
          | "5003"
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
        if ("details" in errorData && errorData.details) {
          const keys = Object.keys(errorData.details)
          if (keys.length > 0 && errorData.details[keys[0]].length > 0) {
            errorMessage = errorData.details[keys[0]][0]
          } else {
            errorMessage = translate("error.something_went_wrong")
          }
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

  return {
    notify,
    notifyTx,
    notifyApiError,
  }
}
