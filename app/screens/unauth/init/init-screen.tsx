import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { load, APP_IS_FRESH_INSTALL_KEY } from "../../../utils/storage"

export const InitScreen = observer(function InitScreen() {
  const { user } = useStores()
  const navigation = useNavigation()
  const [isScreenReady, setIsScreenReady] = useState(false)

  const mounted = async () => {
    await user.loadFromStorage()
    if (user.isLoggedIn) {
      navigation.navigate('lock')
      return
    }

    const isFreshInstall = await load(APP_IS_FRESH_INSTALL_KEY)
    if (isFreshInstall === true) {
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
