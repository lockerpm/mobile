import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { storageKeys, load } from "../../../utils/storage"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import NetInfo from '@react-native-community/netinfo'
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { useCipherToolsMixins } from "../../../services/mixins/cipher/tools"


export const StartScreen = observer(function StartScreen() {
  const { user, uiStore } = useStores()
  const { isBiometricAvailable, notify, translate } = useMixins()
  const { getSyncData, loadFolders, loadCollections, syncAutofillData } = useCipherDataMixins()
  const { loadPasswordsHealth } = useCipherToolsMixins()
  const navigation = useNavigation()

  // ------------------------- PARAMS ----------------------------

  const [msg, setMsg] = useState('')

  // ------------------------- METHODS ----------------------------

  const mounted = async () => {
    await syncAutofillData()
    const connectionState = await NetInfo.fetch()

    // Sync
    if (connectionState.isInternetReachable) {
      // Check if need to sync
      const lastUpdateRes = await user.getLastUpdate()
      if (
        lastUpdateRes.kind !== 'ok' 
        || !user.lastSync 
        || user.lastSync < lastUpdateRes.data.revision_date * 1000
      ) {
        setMsg(translate('start.synching'))
        const syncRes = await getSyncData()

        if (syncRes.kind === 'ok') {
          notify('success', translate('success.sync_success'))
          user.setLastSync(Date.now())
        } else {
          // Prevent duplicate synchronization
          if (syncRes.kind !== 'synching') {
            notify('error', translate('error.sync_failed'))
          }
        }
      }

      // Sync teams and plan
      if (!uiStore.isFromAutoFill) {
        setMsg(translate('start.getting_team_info'))
        const [invitationsRes] = await Promise.all([
          user.getInvitations(),
          user.loadTeams(),
          user.loadPlan(),
        ])
        if (invitationsRes.kind == 'ok') {
          user.setInvitations(invitationsRes.data)
        }
      }
    }
    
    // Load folders and collections
    setMsg(translate('start.decrypting'))
    await Promise.all([
      loadFolders(),
      loadCollections()
    ])
    loadPasswordsHealth()

    // TODO: check device limit
    const isDeviceLimitReached = false
    if (isDeviceLimitReached) {
      navigation.navigate('switchDevice')
    }

    setMsg('')

    // Show biometric intro
    if (!uiStore.isFromAutoFill) {
      const introShown = await load(storageKeys.APP_SHOW_BIOMETRIC_INTRO)
      if (!introShown) {
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
