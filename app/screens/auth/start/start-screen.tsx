import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { storageKeys, load } from "../../../utils/storage"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { delay } from "../../../utils/delay"
import NetInfo from '@react-native-community/netinfo'
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { useCipherToolsMixins } from "../../../services/mixins/cipher/tools"


export const StartScreen = observer(function StartScreen() {
  const { user } = useStores()
  const { isBiometricAvailable, notify, translate } = useMixins()
  const { getSyncData, loadFolders, loadCollections, syncAutofillData } = useCipherDataMixins()
  const { loadPasswordsHealth } = useCipherToolsMixins()
  const navigation = useNavigation()

  const [msg, setMsg] = useState('')

  const mounted = async () => {
    await syncAutofillData()
    const connectionState = await NetInfo.fetch()

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
      setMsg(translate('start.getting_team_info'))
      const [invitationsRes] = await Promise.all([
        user.getInvitations(),
        user.loadTeams(),
        user.loadPlan(),
      ])

      // Invitations handler
      if (invitationsRes.kind == 'ok') {
        user.setInvitations(invitationsRes.data)
      }
    }
    
    setMsg(translate('start.decrypting'))
    await delay(500)
    await Promise.all([
      loadFolders(),
      loadCollections()
    ])
    loadPasswordsHealth()

    // TODO
    const isDeviceLimitReached = false
    if (isDeviceLimitReached) {
      navigation.navigate('switchDevice')
    }

    setMsg('')
    const introShown = await load(storageKeys.APP_SHOW_BIOMETRIC_INTRO)
    if (!introShown) {
      const available = await isBiometricAvailable()
      if (available) {
        navigation.navigate('biometricUnlockIntro')
        return
      }
    }

    navigation.navigate('mainTab', { screen: user.defaultTab })
  }

  // --------------------------- EFFECT ----------------------------

  // Always move forward
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', mounted)
    return unsubscribe
  }, [navigation])


  return (
    <Loading message={msg} />
  )
})
