import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import NetInfo from "@react-native-community/netinfo"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { CipherView, LoginUriView } from "../../../../core/models/view"

export const StartScreen = observer(() => {
  const { user, uiStore, cipherStore } = useStores()
  const { isBiometricAvailable, translate, boostrapPushNotifier, parsePushNotiData } = useMixins()
  const {
    loadFolders,
    loadCollections,
    syncAutofillData,
    loadOrganizations,
  } = useCipherDataMixins()
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
    syncAutofillData()

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
      if (!uiStore.isFromAutoFill) {
        // setMsg(translate('start.getting_plan_info'))
        // await Promise.all([
        //   user.loadTeams(),
        //   user.loadPlan(),
        // ])
        user.loadTeams()
        user.loadPlan()
      }
    }

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
      navigation.navigate(navigationRequest.path, navigationRequest.params)
      return
    }

    // Show biometric intro
    if (!uiStore.isFromAutoFill && !uiStore.isOnSaveLogin) {
      if (!user.biometricIntroShown && !user.isBiometricUnlock) {
        const available = await isBiometricAvailable()
        if (available) {
          navigation.navigate("biometricUnlockIntro")
          return
        }
      }
    }

    // Done -> navigate
    if (uiStore.isFromAutoFill) {
      uiStore.setIsFromAutoFill(false)
      navigation.navigate("autofill")
    } else if (uiStore.isOnSaveLogin) {
      uiStore.setIsOnSaveLogin(false)

      const cipher = newCipherView(
        String(uiStore.saveLogin.domain),
        String(uiStore.saveLogin.domain),
        String(uiStore.saveLogin.domain),
      );

      cipherStore.setSelectedCipher(cipher);
      navigation.navigate("passwords__edit", { mode: 'edit' })
    } else {
      navigation.navigate("mainTab", { screen: user.defaultTab })
    }
  }

  const newCipherView = (domain: string, username: string, password: string): CipherView => {
    const cipher = new CipherView()
    const uriView = new LoginUriView()
    uriView.uri = domain
    cipher.login.uris = new LoginUriView[1]()
    cipher.login.uris[0] = uriView
    cipher.login.username = username
    cipher.login.password = password
    return cipher
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
