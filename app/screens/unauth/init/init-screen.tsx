import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { load, APP_SHOW_INTRO } from "../../../utils/storage"

export const InitScreen = observer(function InitScreen() {
  const { user } = useStores()
  const navigation = useNavigation()
  const [isScreenReady, setIsScreenReady] = useState(false)

  const mounted = async () => {
    if (__DEV__) {
      navigation.navigate('lock')
      return
    }

    await user.loadFromStorage()
    if (user.isLoggedIn) {
      navigation.navigate('lock')
      return
    }

    const isFreshInstall = await load(APP_SHOW_INTRO)
    if (isFreshInstall) {
      navigation.navigate('intro')
    } else {
      navigation.navigate('onBoarding')
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
