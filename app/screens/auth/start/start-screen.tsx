import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { storageKeys, load } from "../../../utils/storage"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { delay } from "../../../utils/delay"
import NetInfo from '@react-native-community/netinfo'


export const StartScreen = observer(function StartScreen() {
  const { user } = useStores()
  const { 
    getSyncData, loadFolders, loadCollections, isBiometricAvailable, notify, translate, 
    loadPasswordsHealth
  } = useMixins()
  const navigation = useNavigation()

  const [msg, setMsg] = useState('')

  const mounted = async () => {
    const connectionState = await NetInfo.fetch()
    if (connectionState.isInternetReachable) {
      setMsg(translate('start.synching'))
      await delay(500)
      const [syncRes, invitationsRes] = await Promise.all([
        getSyncData(),
        user.getInvitations(),
        user.loadTeams(),
        user.loadPlan(),
      ])

      // Sync handler
      if (syncRes.kind === 'ok') {
        notify('success', translate('success.sync_success'))
      } else {
        if (syncRes.kind !== 'synching') {
          notify('error', translate('error.sync_failed'))
        }
      }

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

    navigation.navigate('mainTab', { screen: 'homeTab' })
  }

  // Life cycle
  useEffect(() => {
    mounted()
  }, [])

  return (
    <Loading message={msg} />
  )
})
