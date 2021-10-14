import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { storageKeys, load } from "../../../utils/storage"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { delay } from "../../../utils/delay"

export const StartScreen = observer(function StartScreen() {
  const { user, uiStore } = useStores()
  const { 
    getSyncData, loadFolders, loadCollections, isBiometricAvailable, notify, translate
  } = useMixins()
  const navigation = useNavigation()

  const mounted = async () => {
    if (!uiStore.isOffline) {
      await delay(1000)
      const [syncRes] = await Promise.all([
        getSyncData(),
        user.loadTeams(),
        user.loadPlan()
      ])

      if (syncRes.kind === 'ok') {
        notify('success', translate('success.sync_success'))
      } else {
        notify('error', translate('error.sync_failed'))
      }
      await delay(1000)
    }
    
    await Promise.all([
      loadFolders(),
      loadCollections()
    ])

    // TODO
    const isDeviceLimitReached = false
    if (isDeviceLimitReached) {
      navigation.navigate('switchDevice')
    }

    const introShown = await load(storageKeys.APP_SHOW_BIOMETRIC_INTRO)
    if (!introShown) {
      const available = await isBiometricAvailable()
      if (available) {
        navigation.navigate('biometricUnlockIntro')
        return
      }
    }

    navigation.navigate('mainTab')
  }

  // Life cycle
  useEffect(() => {
    mounted()
  }, [])

  return (
    <Loading />
  )
})
