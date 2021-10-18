import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { load, save, storageKeys } from "../../../utils/storage"
import NetInfo from '@react-native-community/netinfo'
import DeviceInfo from 'react-native-device-info'


export const InitScreen = observer(function InitScreen() {
  const { user } = useStores()
  const navigation = useNavigation()

  const goLockOrCreatePassword = () => {
    if (user.is_pwd_manager) {
      navigation.navigate('lock')
    } else {
      navigation.navigate('createMasterPassword')
    }
  }

  const mounted = async () => {
    user.setLanguage(user.language)
    user.setDeviceID(DeviceInfo.getUniqueId())

    // Testing
    // if (__DEV__) {
    //   navigation.navigate('createMasterPassword')
    //   return
    // }

    // Logged in?
    if (!user.isLoggedIn) {
      const introShown = await load(storageKeys.APP_SHOW_INTRO)
      if (!introShown) {
        await save(storageKeys.APP_SHOW_INTRO, 1)
        navigation.navigate('intro')
      } else {
        navigation.navigate('onBoarding')
      }
      return
    }

    // Network connected?
    const connectionState = await NetInfo.fetch()
    if (!connectionState.isConnected) {
      goLockOrCreatePassword()
      return
    }

    // Session validated?
    if (!user.token) {
      navigation.navigate('login')
      return
    }
    
    user.saveToken(user.token)

    const [userRes, userPwRes] = await Promise.all([
      user.getUser(),
      user.getUserPw()
    ])
    if (userRes.kind === 'ok' && userPwRes.kind === 'ok') {
      goLockOrCreatePassword()
    } else {
      navigation.navigate('login')
    }
  }

  // Life cycle
  useEffect(() => {
    setTimeout(mounted, 1500)
    // mounted()
  }, [])

  return (
    <Loading />
  )
})
