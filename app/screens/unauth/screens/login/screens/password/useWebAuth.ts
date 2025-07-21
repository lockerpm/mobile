import { LoginOptions, User2FAMethod } from "app/static/types"
import { credentialAuthOptions, publicKeyCredentialWithAssertion } from "app/utils/passkey"

import { Passkey, PasskeyGetResult, PasskeyGetRequest } from "react-native-passkey"
import { useStores } from "app/models"
import { useToast } from "app/services/utils"

type WebAuthParams = {
  setLoginMethodLoading: (val: LoginOptions) => void
  onGoToPinCode: () => void
  handleLoginSuccess: (data: {
    is_factor2: boolean
    methods: User2FAMethod[]
    access_token: string
  }) => void
}

export const useWebAuth = ({
  setLoginMethodLoading,
  onGoToPinCode,
  handleLoginSuccess,
}: WebAuthParams) => {
  const { user } = useStores()
  const { notifyTx, notifyApiError } = useToast()

  const handleWebAuthLogin = async (username: string, withSecurityKey = false) => {
    setLoginMethodLoading(LoginOptions.PASSKEY)
    const resAuthPasskeyOptions = await user.authPasskeyOptions(username)
    if (resAuthPasskeyOptions.kind === "ok") {
      try {
        const authRequest: PasskeyGetRequest = credentialAuthOptions(resAuthPasskeyOptions.data)
        // Call the `authenticate` method with the retrieved request in JSON format
        // A native overlay will be displayed
        let result: PasskeyGetResult
        if (withSecurityKey) {
          result = await Passkey.getSecurityKey(authRequest)
        } else {
          result = await Passkey.getPlatformKey(authRequest)
        }

        const res = await user.authPasskey({
          username,
          response: publicKeyCredentialWithAssertion(result),
        })

        if (res.kind === "ok") {
          handleLoginSuccess({
            is_factor2: res.data.is_factor2 ?? false,
            methods: res.data.methods ?? [],
            access_token: "access_token" in res.data ? res.data.access_token : "",
          })
        } else {
          if (res.kind === "unauthorized") {
            notifyTx("error", "passkey:error.login_failed")
          }
          onGoToPinCode()
        }
        // The `authenticate` method returns a FIDO2 assertion result
        // Pass it to your server for verification
      } catch (error: any) {
        // Handle Error...
        if (error.error === "UserCancelled") {
          notifyTx("error", "passkey:error.user_cancel")
        } else if (error.error === "NotCredentials") {
          notifyTx("error", "passkey:error.no_credential")
        } else {
          notifyTx("error", "error:something_went_wrong")
        }
        onGoToPinCode()
      }
    } else {
      notifyApiError(resAuthPasskeyOptions)
    }
    setLoginMethodLoading(LoginOptions.NONE)
  }

  return {
    handleWebAuthLogin,
  }
}
