import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import Flurry from "react-native-flurry-sdk"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import NetInfo from "@react-native-community/netinfo"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"

export const StartScreen = observer(() => {
  const { user, uiStore, enterpriseStore } = useStores()
  const { isBiometricAvailable, translate, boostrapPushNotifier, parsePushNotiData } = useMixins()
  const { loadFolders, loadCollections, loadOrganizations } = useCipherDataMixins()
  const navigation = useNavigation()
  // ------------------------- PARAMS ----------------------------

  const [msg, setMsg] = useState("")

  // ------------------------- METHODS ----------------------------
  const refreshFCM = async () => {
    if (!user.disablePushNotifications) {
      let isSuccess = true
      if (!user.fcmToken) {
        isSuccess = await boostrapPushNotifier()
      }
      if (isSuccess) {
        user.updateFCM(user.fcmToken)
      }
    }
  }

  const mounted = async () => {
    // Testing
    // if (__DEV__) {
    //   navigation.navigate('dataOutdated')
    //   return
    // }

    const connectionState = await NetInfo.fetch()
    // Sync
    if (connectionState.isConnected) {
      // Refresh FCM
      refreshFCM()

      // Sync teams and plan
      if (!uiStore.isFromAutoFill && !uiStore.isOnSaveLogin && !uiStore.isFromAutoFillItem) {
        // setMsg(translate('start.getting_plan_info'))
        // await Promise.all([
        //   user.loadTeams(),
        //   user.loadPlan(),
        // ])
        await user.loadTeams()
        await user.loadPlan()
      }
    }

    // Log user id
    Flurry.setUserId(user.pwd_user_id)

    // Load folders and collections
    setMsg(translate("start.decrypting"))
    Promise.all([loadFolders(), loadCollections(), loadOrganizations()])

    // TODO: check device limit
    const isDeviceLimitReached = false
    if (isDeviceLimitReached) {
      navigation.navigate("switchDevice")
    }

    setMsg("")

    // Parse push noti data
    const navigationRequest = await parsePushNotiData()
    if (navigationRequest.path) {
      // handle navigate browse
      navigationRequest.tempParams &&
        navigation.navigate(navigationRequest.path, navigationRequest.tempParams)
      navigation.navigate(navigationRequest.path, navigationRequest.params)
      return
    }

    if (!uiStore.isFromAutoFill && !uiStore.isOnSaveLogin && !uiStore.isFromAutoFillItem) {
      if (!user.biometricIntroShown && !user.isBiometricUnlock) {
        const available = await isBiometricAvailable()
        if (available) {
          navigation.navigate("biometricUnlockIntro")
          return
        }
      }
    }

    // Done -> navigate
    if (uiStore.isDeeplinkEmergencyAccess) {
      uiStore.setIsDeeplinkEmergencyAccess(false)
      navigation?.navigate("mainTab", { screen: "menuTab" })
      navigation.navigate("emergencyAccess")
    } else if (uiStore.isDeeplinkShares) {
      uiStore.setIsDeeplinkShares(false)
      navigation?.navigate("mainTab", { screen: "browseTab" })
      navigation?.navigate("mainTab", { screen: "browseTab", params: { screen: "shares" } })
    } else if (uiStore.isFromAutoFill) {
      uiStore.setIsFromAutoFill(false)
      navigation.navigate("autofill")
    } else if (uiStore.isFromAutoFillItem) {
      uiStore.setIsFromAutoFillItem(false)
      navigation.navigate("autofill", { mode: "item" })
    } else if (uiStore.isOnSaveLogin) {
      // uiStore.setIsOnSaveLogin(false)
      navigation.navigate("passwords__edit", { mode: "add" })
    } else if (!!enterpriseStore.isEnterpriseInvitations) {
      navigation.navigate("enterpriseInvited")
    } else {
      navigation.navigate("mainTab", { screen: user.defaultTab })
    }
  }

  // --------------------------- EFFECT ----------------------------

  // Always move forward
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", mounted)
    return unsubscribe
  }, [navigation])

  // ------------------------- RENDER ----------------------------

  return <Loading message={msg} />
})
