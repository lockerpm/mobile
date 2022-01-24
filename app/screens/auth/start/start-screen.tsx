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


export const StartScreen = observer(function StartScreen() {
  const { user, uiStore } = useStores()
  const { isBiometricAvailable, translate } = useMixins()
  const { loadFolders, loadCollections, syncAutofillData, loadOrganizations } = useCipherDataMixins()
  const { loadPasswordsHealth } = useCipherToolsMixins()
  const navigation = useNavigation()

  // ------------------------- PARAMS ----------------------------

  const [msg, setMsg] = useState('')

  // ------------------------- METHODS ----------------------------

  const mounted = async () => {
    if (IS_IOS) {
      await syncAutofillData()
    }
    const connectionState = await NetInfo.fetch()

    // Sync
    if (connectionState.isInternetReachable) {
      // Update FCM
      user.updateFCM(user.fcmToken)

      // Sync teams and plan
      if (!uiStore.isFromAutoFill) {
        // setMsg(translate('start.getting_team_info'))
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
    await Promise.all([
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

    // Show biometric intro
    if (!uiStore.isFromAutoFill) {
      if (!user.biometricIntroShown) {
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
