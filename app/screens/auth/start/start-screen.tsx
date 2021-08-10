import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { APP_SHOW_BIOMETRIC_INTRO, load } from "../../../utils/storage"
import { useMixins } from "../../../services/mixins"
// import { useStores } from "../../../models"

export const StartScreen = observer(function StartScreen() {
  const { getSyncData } = useMixins()
  const navigation = useNavigation()
  const [isScreenReady, setIsScreenReady] = useState(false)

  const mounted = async () => {
    if (__DEV__) {
      navigation.navigate('passwords__info')
      return
    }

    await getSyncData()

    // TODO
    const isDeviceLimitReached = false
    if (isDeviceLimitReached) {
      navigation.navigate('switchDevice')
    }

    const isFreshInstall = await load(APP_SHOW_BIOMETRIC_INTRO)
    if (isFreshInstall) {
      navigation.navigate('biometricUnlockIntro')
    } else {
      navigation.navigate('mainTab')
    }
  }

  // Life cycle
  useEffect(() => {
    if (!isScreenReady) {
      mounted()
      setIsScreenReady(true)
    }
  }, [isScreenReady])

  return (
    <Loading />
  )
})
