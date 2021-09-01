import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { storageKeys, load } from "../../../utils/storage"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"

export const StartScreen = observer(function StartScreen() {
  const { user } = useStores()
  const { getSyncData, loadFolders, loadCollections, isBiometricAvailable } = useMixins()
  const navigation = useNavigation()

  const mounted = async () => {
    if (!user.isOffline) {
      await Promise.all([
        getSyncData(),
        user.loadTeams(),
        user.loadPlan()
      ])
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
