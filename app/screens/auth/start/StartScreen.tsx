import React, { FC, useEffect, useState } from 'react'
import { useStores } from 'app/models'
import NetInfo from '@react-native-community/netinfo'
import { useCipherData, useHelper } from 'app/services/hook'
import { Loading } from 'app/components/utils'
import { observer } from 'mobx-react-lite'
import { AppStackScreenProps } from 'app/navigators/navigators.types'
import { AndroidAutofillServiceType } from 'app/utils/autofillHelper'

export const StartScreen: FC<AppStackScreenProps<'start'>> = observer((props) => {
  const { user, uiStore, enterpriseStore } = useStores()
  const { isBiometricAvailable, boostrapPushNotifier, parsePushNotiData, translate } = useHelper()
  const { loadFolders, loadCollections, loadOrganizations } = useCipherData()
  const navigation = props.navigation
  // ------------------------- PARAMS ----------------------------

  const [msg, setMsg] = useState('')

  // ------------------------- METHODS ----------------------------

  const refreshFCM = async () => {
    if (!user.disablePushNotifications) {
      let isSuccess = true
      if (!user.fcmToken) {
        isSuccess = await boostrapPushNotifier()
      }
      if (isSuccess) {
        user.updateFCM(user.fcmToken)
      }
    }
  }

  console.log(user.fcmToken)
  const mounted = async () => {
    const connectionState = await NetInfo.fetch()
    // Sync
    if (connectionState.isConnected) {
      // Refresh FCM
      refreshFCM()

      // Sync teams and plan
      if (!uiStore.isAndroidAutofillService) {
        await user.loadTeams()
      }
    }

    // Load folders and collections
    setMsg(translate('start.decrypting'))
    Promise.all([loadFolders(), loadCollections(), loadOrganizations()])

    setMsg('')

    // Parse push noti data
    const navigationRequest = await parsePushNotiData()
    if (navigationRequest.path) {
      // handle navigate browse

      navigationRequest.tempParams &&
        // @ts-ignore TODO
        navigation.navigate(navigationRequest.path, navigationRequest.tempParams)

      // @ts-ignore TODO
      navigation.navigate(navigationRequest.path, navigationRequest.params)
      return
    }

    if (!uiStore.isAndroidAutofillService) {
      if (
        (!user.biometricIntroShown || uiStore.isStartFromPasswordLess) &&
        !user.isBiometricUnlock
      ) {
        uiStore.setStartFromPasswordLess(false)
        const available = await isBiometricAvailable()
        if (available) {
          navigation.navigate('biometricUnlockIntro')
          return
        }
      }
    }

    // // Done -> navigate
    if (uiStore.isAndroidAutofillService) {
      const data = uiStore.androidAutofillServiceData
      if (data.type === AndroidAutofillServiceType.SAVE_REQUEST) {
        navigation.navigate('passwords__edit', { mode: 'add', androidAutofillSavedData: data })
      } else {
        navigation.navigate('autofill', { data })
      }
      return
    }

    if (uiStore.isDeeplinkEmergencyAccess) {
      uiStore.setIsDeeplinkEmergencyAccess(false)
      navigation?.navigate('mainTab', { screen: 'menuTab' })
      navigation.navigate('emergencyAccess')
    } else if (uiStore.isDeeplinkShares) {
      uiStore.setIsDeeplinkShares(false)
      navigation?.navigate('mainTab', { screen: 'browseTab' })

      // @ts-ignore TODO
      navigation?.navigate('mainTab', { screen: 'browseTab', params: { screen: 'shares' } })
    } else if (enterpriseStore.isEnterpriseInvitations) {
      navigation.navigate('enterpriseInvited')
    } else {
      navigation.navigate('mainTab', { screen: user.defaultTab })
    }
  }

  // --------------------------- EFFECT ----------------------------

  // Always move forward
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', mounted)
    return unsubscribe
  }, [navigation])

  // ------------------------- RENDER ----------------------------

  return <Loading message={msg} />
})
