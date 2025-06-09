import { useStores } from "app/models"
import { useToast } from "app/services/utils"
import { LoginOptions, User2FAMethod } from "app/static/types"

type LoginPasswordParams = {
  setIsError: (val: boolean) => void
  setLoginMethodLoading: (val: LoginOptions) => void
  handleLoginSuccess: (data: {
    is_factor2: boolean
    methods: User2FAMethod[]
    access_token: string
  }) => void
}

export const useLoginPassword = ({
  setLoginMethodLoading,
  setIsError,
  handleLoginSuccess,
}: LoginPasswordParams) => {
  const { user } = useStores()
  const { notifyTx, notifyApiError, notify } = useToast()

  const handlePasswordLogin = async (username: string, password: string) => {
    setLoginMethodLoading(LoginOptions.PASSWORD)
    setIsError(false)

    const res = await user.login({ username, password })
    setLoginMethodLoading(LoginOptions.NONE)
    if (res.kind !== "ok") {
      setIsError(true)
      if (res.kind === "unauthorized" && res.data) {
        const errorData: {
          code: string
          message: string
        } = res.data
        switch (errorData.code) {
          case "1001": {
            notifyTx("error", "error.wrong_username_or_password")
            break
          }
          case "1003": {
            notifyTx("error", "error.account_not_activated")
            break
          }
          default: {
            notify("error", errorData.message)
          }
        }
      } else {
        notifyApiError(res)
      }
    } else {
      handleLoginSuccess({
        is_factor2: res.data.is_factor2 ?? false,
        methods: res.data.methods ?? [],
        access_token: "access_token" in res.data ? res.data.access_token : "",
      })
    }
  }
  return {
    handlePasswordLogin,
  }
}
