import { CommonActions, useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { RootStackScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { LockType } from "app/static/types"
import { useCallback } from "react"

/**
 * When authen success, requets users data and navigate to the next screen
 * If user is pwd manager, navigate to lock screen
 * If user is not pwd manager, navigate to create master password screen
 */
export const useLoggedIn = () => {
  const { notifyTx } = useToast()
  const navigation = useNavigation<RootStackScreenProps<"unAuthStack">["navigation"]>()
  const { user } = useStores()

  const onLoggedIn = useCallback(async () => {
    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    if (userRes.kind === "ok" && userPwRes.kind === "ok") {
      if (userPwRes.user.is_pwd_manager) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "lock", params: { type: LockType.Individual } }],
          }),
        )
      } else {
        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              { name: "init" },
              {
                name: "unAuthStack",
                params: { screen: "createMasterPassword" },
              },
            ],
          }),
        )
      }
    } else {
      notifyTx("error", "passkey.error.login_failed")
    }
  }, [])

  return {
    onLoggedIn,
  }
}
