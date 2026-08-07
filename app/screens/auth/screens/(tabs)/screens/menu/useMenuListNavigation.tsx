import { CommonActions, useNavigation } from "@react-navigation/native"

import { AuthScreenProps } from "app/navigators/navigators.types"

import { useAuthentication } from "@/services/hook"
import { LockType } from "@/static/types"

export const useMenuListNavigation = () => {
  const navigation = useNavigation<AuthScreenProps<"mainTab">["navigation"]>()
  const { lock, logout } = useAuthentication()

  const navigateToPayment = () => {
    navigation.navigate("menuStack", {
      screen: "payment",
    })
  }

  const navigateToFamilyPayment = () => {
    navigation.navigate("menuStack", {
      screen: "payment",
      params: {
        family: true,
        benefitTab: 3,
      },
    })
  }

  const navigateToInviteMember = () => {
    navigation.navigate("menuStack", {
      screen: "inviteToFamilyStack",
      params: {
        screen: "manageMember",
      },
    })
  }

  const navigateToSettings = () => {
    navigation.navigate("menuStack", {
      screen: "settingsStack",
      params: {
        screen: "settings",
      },
    })
  }
  const navigateToReferfriend = () => {
    navigation.navigate("menuStack", {
      screen: "referFriend",
    })
  }
  const navigateToHelp = () => {
    navigation.navigate("menuStack", {
      screen: "help",
    })
  }

  const navigateToLockScreen = async () => {
    await lock()
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "lock", params: { type: LockType.Individual } }],
      })
    )
  }

  const navigateToLogoutScreen = async () => {
    logout()
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "init" }],
      })
    )
  }

  return {
    navigateToPayment,
    navigateToFamilyPayment,
    navigateToInviteMember,
    navigateToSettings,
    navigateToHelp,
    navigateToReferfriend,
    navigateToLockScreen,
    navigateToLogoutScreen,
  }
}
