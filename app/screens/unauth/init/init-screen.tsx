import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { load, save, storageKeys } from "../../../utils/storage"
import NetInfo from '@react-native-community/netinfo'
import DeviceInfo from 'react-native-device-info'
import { IS_IOS } from "../../../config/constants"
import { BackHandler, Appearance } from "react-native"


export const InitScreen = observer(function InitScreen() {
  const { user, cipherStore, uiStore } = useStores()
  const navigation = useNavigation()
  const theme = Appearance.getColorScheme()

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
    cipherStore.setIsSynching(false)

    if (uiStore.isDark === null) {
      uiStore.setIsDark(theme === 'dark')
    }

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
    if (!connectionState.isInternetReachable) {
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

  // No back here
  useEffect(() => {
    const handleBack = (e) => {
      e.preventDefault()
      if (!IS_IOS) {
        BackHandler.exitApp()
      }
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])

  return (
    <Loading />
  )
})
