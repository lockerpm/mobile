import { useNavigation } from "@react-navigation/native"
import { RootNavigation } from "app/navigators"
import { AppStackScreenProps } from "app/navigators/navigators.types"

export const useMenuListNavigation = () => {
  const navigation = useNavigation<AppStackScreenProps<"mainTab">["navigation"]>()

  const navigateToManagePlan = () => {
    navigation.navigate("menuStack", {
      screen: "managePlan",
    })
  }

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
      screen: "inviteMember",
    })
  }

  const navigateToSettings = () => {
    navigation.navigate("menuStack", {
      screen: "settingsStack",
    })
  }
  const navigateToReferfriend = (referLink: string) => {
    navigation.navigate("menuStack", {
      screen: "referFriend",
      params: {
        referLink,
      },
    })
  }
  const navigateToHelp = () => {
    navigation.navigate("menuStack", {
      screen: "help",
    })
  }
  const navigateToLockScreen = () => {
    RootNavigation.navigate("lock")
  }

  return {
    navigateToManagePlan,
    navigateToPayment,
    navigateToFamilyPayment,
    navigateToInviteMember,
    navigateToSettings,
    navigateToHelp,
    navigateToReferfriend,
    navigateToLockScreen,
  }
}
