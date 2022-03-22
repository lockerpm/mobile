import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { load, StorageKey } from "../../../utils/storage"
import NetInfo from '@react-native-community/netinfo'
import DeviceInfo from 'react-native-device-info'
import { IS_IOS } from "../../../config/constants"
import { BackHandler, Appearance } from "react-native"
import { useMixins } from "../../../services/mixins"


export const InitScreen = observer(() => {
  const { user, cipherStore, uiStore } = useStores()
  const navigation = useNavigation()
  const theme = Appearance.getColorScheme()
  const { boostrapPushNotifier } = useMixins()

  // ------------------ METHODS ---------------------

  const goLockOrCreatePassword = () => {
    if (user.is_pwd_manager) {
      navigation.navigate('lock')
    } else {
      navigation.navigate('createMasterPassword')
    }
  }

  const checkAutoFill = async () => {
    const autoFillData = await load(StorageKey.APP_FROM_AUTOFILL)
    if (autoFillData && autoFillData.enabled) {
      uiStore.setDeepLinkAction('fill', autoFillData.domain || '')
      uiStore.setIsFromAutoFill(true)
      return true
    }

    uiStore.setIsFromAutoFill(false)
    return false
  }

  const mounted = async () => {
    const connectionState = await NetInfo.fetch()

    // Setup basic data
    user.setLanguage(user.language)
    user.setDeviceID(DeviceInfo.getUniqueId())
    cipherStore.setIsSynching(false)
    if (uiStore.isDark === null) {
      uiStore.setIsDark(theme === 'dark')
    }

    // Reload FCM
    if (connectionState.isConnected) {
      await boostrapPushNotifier()
    }

    // Check autofill
    const isAutoFill = await checkAutoFill()

    // Testing
    // if (__DEV__) {
    //   navigation.navigate('createMasterPassword')
    //   return
    // }

    // Logged in?
    if (!user.isLoggedIn) {
      if (!user.introShown && !isAutoFill) {
        user.setIntroShown(true)
        navigation.navigate('intro')
      } else {
        navigation.navigate('onBoarding')
      }
      return
    }

    // Network connected? || Is autofill?
    if (!connectionState.isConnected || isAutoFill) {
      goLockOrCreatePassword()
      return
    }

    // Session validated?
    if (!user.isLoggedIn) {
      navigation.navigate('login')
      return
    }
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

  // ------------------ EFFECTS ---------------------

  // Mounted
  useEffect(() => {
    setTimeout(mounted, 1500)
    // mounted()
  }, [])

  // Back handler
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

  // ------------------ RENDER ---------------------

  return (
    <Loading />
  )
})
