import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { load, save, storageKeys } from "../../../utils/storage"

export const InitScreen = observer(function InitScreen() {
  const { user } = useStores()
  const navigation = useNavigation()
  const [isScreenReady, setIsScreenReady] = useState(false)

  const mounted = async () => {
    if (user.isLoggedIn) {
      if (user.is_pwd_manager) {
        navigation.navigate('lock')
      } else {
        navigation.navigate('createMasterPassword')
      }
      return
    }

    const introShown = await load(storageKeys.APP_SHOW_INTRO)
    if (!introShown) {
      await save(storageKeys.APP_SHOW_INTRO, 1)
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
