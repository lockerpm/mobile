import { Logger } from "@/utils/logger"
import { useStores } from "app/models"
import { useToast } from "app/services/utils"
import { getCookies, logRegisterSuccessEvent } from "app/utils/analytics"
import { credentialCreationOptions, publicKeyCredentialWithAttestation } from "app/utils/passkey"
import { useCallback } from "react"
import { Passkey, PasskeyCreateResult } from "react-native-passkey"

type PasskeyRegistrationParams = {
  setIsLoading: (val: boolean) => void
  navigateLogin: () => void
  onRegisterWithPinCode: () => void
}

export const useSignupWebauth = ({
  setIsLoading,
  navigateLogin,
  onRegisterWithPinCode,
}: PasskeyRegistrationParams) => {
  const { user } = useStores()
  const { notifyTx, notifyApiError } = useToast()

  const handleRegisterWebauth = useCallback(
    async (email: string, fullname: string, withSecurityKey = false) => {
      const resPassKeyOptions = await user.registerPasskeyOptions({
        email,
        full_name: fullname,
        algorithms: ["es256", "rs256"],
      })
      if (resPassKeyOptions.kind === "ok") {
        try {
          const requestJson = credentialCreationOptions(resPassKeyOptions.data)
          let result: PasskeyCreateResult
          if (withSecurityKey) {
            result = await Passkey.createSecurityKey(requestJson)
          } else {
            result = await Passkey.createPlatformKey(requestJson)
          }

          const res = await user.registerPasskey({
            email,
            password: "",
            country: "vi",
            confirm_password: "",
            full_name: fullname,
            request_code: "",
            scope: "pwdmanager",
            utm_source: await getCookies("utm_source"),
            response: publicKeyCredentialWithAttestation(result),
          })
          setIsLoading(false)
          if (res.kind === "ok") {
            logRegisterSuccessEvent()
            notifyTx("success", "signup:signup_successful")
            navigateLogin()
          } else {
            notifyApiError(res)
            onRegisterWithPinCode()
          }
        } catch (error: any) {
          Logger.error("useSignupWebauth", "handleRegisterWebauth", error)
          onRegisterWithPinCode()
          notifyTx("error", "passkey:error.user_cancel")
        }
      } else {
        notifyApiError(resPassKeyOptions)
        onRegisterWithPinCode()
      }
    },
    [navigateLogin, notifyApiError, notifyTx, onRegisterWithPinCode, setIsLoading, user]
  )

  return {
    handleRegisterWebauth,
  }
}
