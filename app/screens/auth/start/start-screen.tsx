import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import NetInfo from '@react-native-community/netinfo'
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { useCipherToolsMixins } from "../../../services/mixins/cipher/tools"
import { IS_IOS } from "../../../config/constants"


export const StartScreen = observer(() => {
  const { user, uiStore } = useStores()
  const { isBiometricAvailable, translate, boostrapPushNotifier, parsePushNotiData } = useMixins()
  const { loadFolders, loadCollections, syncAutofillData, loadOrganizations } = useCipherDataMixins()
  const { loadPasswordsHealth } = useCipherToolsMixins()
  const navigation = useNavigation()

  // ------------------------- PARAMS ----------------------------

  const [msg, setMsg] = useState('')

  // ------------------------- METHODS ----------------------------

  const refreshFCM = async () => {
    if (!user.disablePushNotifications) {
      let isSuccess = true
      if (!user.fcmToken) {
        isSuccess = await boostrapPushNotifier()
      }
      if (isSuccess) {
        console.log(user.fcmToken)
        user.updateFCM(user.fcmToken)
      }
    }
  }

  const mounted = async () => {
    if (IS_IOS) {
      syncAutofillData()
    }

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
    setMsg(translate('start.decrypting'))
    Promise.all([
      loadFolders(),
      loadCollections(),
      loadOrganizations()
    ])
    if (!uiStore.isFromAutoFill) {
      loadPasswordsHealth()
    }

    // TODO: check device limit
    const isDeviceLimitReached = false
    if (isDeviceLimitReached) {
      navigation.navigate('switchDevice')
    }

    setMsg('')

    // Parse push noti data
    const navigationRequest = await parsePushNotiData()
    if (navigationRequest.path) {
      navigation.navigate(navigationRequest.path, navigationRequest.params)
      return
    }

    // Show biometric intro
    if (!uiStore.isFromAutoFill) {
      if (!user.biometricIntroShown && !user.isBiometricUnlock) {
        const available = await isBiometricAvailable()
        if (available) {
          navigation.navigate('biometricUnlockIntro')
          return
        }
      }
    }
    
    // Done -> navigate
    if (uiStore.isFromAutoFill) {
      uiStore.setIsFromAutoFill(false)
      navigation.navigate('autofill')
    } else {
      navigation.navigate('mainTab', { screen: user.defaultTab })
    }
  }

  // --------------------------- EFFECT ----------------------------

  // Always move forward
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', mounted)
    return unsubscribe
  }, [navigation])

  // ------------------------- RENDER ----------------------------

  return (
    <Loading message={msg} />
  )
})
