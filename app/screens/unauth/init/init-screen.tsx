import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Loading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { load, StorageKey } from "../../../utils/storage"
import NetInfo from '@react-native-community/netinfo'
import DeviceInfo from 'react-native-device-info'
import { IS_IOS } from "../../../config/constants"
import { BackHandler } from "react-native"
import { useMixins } from "../../../services/mixins"



export const InitScreen = observer(() => {
  const { user, cipherStore, uiStore } = useStores()
  const navigation = useNavigation()
  // const theme = Appearance.getColorScheme()
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
    if (IS_IOS) return false

    const autoFillData = await load(StorageKey.APP_FROM_AUTOFILL)
    if (autoFillData && autoFillData.enabled) {
      uiStore.setDeepLinkAction('fill', autoFillData.domain || '')
      uiStore.setIsFromAutoFill(true)
      return true
    }

    uiStore.setIsFromAutoFill(false)
    return false
  }

  const checkAutoFillItem = async () => {
    if (IS_IOS) return false

    const autoFillData = await load(StorageKey.APP_FROM_AUTOFILL_ITEM)
    if (autoFillData && autoFillData.enabled) {
      uiStore.setDeepLinkAction('fill_item', autoFillData.id || '')
      uiStore.setIsFromAutoFillItem(true)
      return true
    }

    uiStore.setIsFromAutoFillItem(false)
    return false
  }

  const checkOnSaveLogin = async () => {
    if (IS_IOS) return false

    const loginData = await load(StorageKey.APP_FROM_AUTOFILL_ON_SAVE_REQUEST)
    if (loginData && loginData.enabled) {
      uiStore.setDeepLinkAction('save', { domain: loginData.domain, username: loginData.username, password: loginData.password })
      uiStore.setIsOnSaveLogin(true)
      return true
    }

    uiStore.setIsOnSaveLogin(false)
    return false
  }

  const mounted = async () => {
    const connectionState = await NetInfo.fetch()

    // Setup basic data
    user.setLanguage(user.language)
    if (!user.deviceId) {
      user.setDeviceId(DeviceInfo.getUniqueId())
    }
    cipherStore.setIsSynching(false)

    // TODO
    // if (uiStore.isDark === null) {
    //   uiStore.setIsDark(theme === 'dark')
    // }
    uiStore.setIsDark(false)

    // Reload FCM
    if (connectionState.isConnected) {
      await boostrapPushNotifier()
    }

    // Check autofill
    const isAutoFill = await checkAutoFill()

    // Check autofillItem
    const isAutoFillItem = await checkAutoFillItem()

    // Check savePassword
    const isOnSaveLogin = await checkOnSaveLogin()

    navigation.navigate('intro')
      return
    // Testing
    if (__DEV__) {
      // navigation.navigate('createMasterPassword')
      navigation.navigate('intro')
      return
    }
    
    // Logged in?
    if (!user.isLoggedIn) {
      if (!user.introShown && !isAutoFill && !isOnSaveLogin && !isAutoFillItem) {
        user.setIntroShown(true)
        navigation.navigate('intro')
      } else {
        navigation.navigate('onBoarding')
      }
      return
    }


    // Network connected? || Is autofill?
    if (!connectionState.isConnected || isAutoFill || isOnSaveLogin || isAutoFillItem) {

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


  useEffect(() => {
    mounted()
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

  return <Loading />
})
