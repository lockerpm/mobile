import React, { FC, useEffect, useState } from 'react'
import { Alert, Linking, View } from 'react-native'

import VersionCheck from 'react-native-version-check'
import Intercom from '@intercom/intercom-react-native'
import dynamicLinks from '@react-native-firebase/dynamic-links'
import NetInfo from '@react-native-community/netinfo'
import DeviceInfo from 'react-native-device-info'
import JailMonkey from 'jail-monkey'
import { useStores } from 'app/models'
import { IS_PROD } from 'app/config/constants'
import { Logger } from 'app/utils/utils'
import { useAuthentication, useHelper } from 'app/services/hook'
import { Text } from 'app/components/cores'
import { Loading } from 'app/components/utils'
import { LockType } from '../lock/lock.types'
import { observer } from 'mobx-react-lite'
import { RootStackScreenProps } from 'app/navigators/navigators.types'
import { useTheme } from 'app/services/context'

export const InitScreen: FC<RootStackScreenProps<'init'>> = observer((props) => {
  const { translate } = useHelper()
  const { colors } = useTheme()
  const { user, cipherStore } = useStores()
  const navigation = props.navigation

  const { boostrapPushNotifier } = useHelper()
  const { handleDynamicLink } = useAuthentication()

  // ------------------ METHODS ---------------------

  const [isRooted, setIsRooted] = useState(false)

  // ------------------ METHODS ---------------------

  // Check jailbreak/rooted
  const checkTrustFall = () => {
    const trustfall = JailMonkey.isJailBroken()
    setIsRooted(trustfall)
    return trustfall
  }

  // Create master pass or unlock
  const goLockOrCreatePassword = () => {
    if (user.is_pwd_manager) {
      if (user.onPremiseUser) {
        navigation.navigate('lock', { type: LockType.OnPremise })
      } else {
        navigation.navigate('lock', { type: LockType.Individual })
      }
    } else {
      navigation.navigate('createMasterPassword')
    }
  }

  const checkAppUpdate = () => {
    !__DEV__ &&
      IS_PROD &&
      VersionCheck.needUpdate()
        .then(async (res) => {
          const showAlert = () => {
            Alert.alert(
              translate('alert.update.title'),
              translate('alert.update.content', { version: res.latestVersion }),
              [
                {
                  text: translate('alert.update.later'),
                  style: 'cancel',
                  onPress: () => null,
                },
                {
                  text: translate('alert.update.now'),
                  style: 'destructive',
                  onPress: async () => {
                    Linking.openURL(res.storeUrl) // open store if update is needed.
                  },
                },
              ]
            )
          }

          const { currentVersion, latestVersion } = res
          try {
            if (parseFloat(currentVersion) < parseFloat(latestVersion)) {
              showAlert()
            }
          } catch (e) {
            if (res.isNeeded) {
              showAlert()
            }
          }
        })
        .catch((e) => {
          Logger.error(e)
        })
  }

  // Mounted
  const mounted = async () => {
    if (checkTrustFall()) {
      return
    }

    await Intercom.logout()

    const connectionState = await NetInfo.fetch()

    // Setup basic data
    user.setLanguage(user.language)

    if (!user.deviceId) {
      user.setDeviceId(await DeviceInfo.getUniqueId())
    }
    cipherStore.setIsSynching(false)

    // uiStore.setIsDark(false)

    // Reload FCM
    if (connectionState.isConnected) {
      await boostrapPushNotifier()
    }

    checkAppUpdate()

    // Check dynamic link
    const link = await dynamicLinks().getInitialLink()
    if (link) {
      Logger.debug(`DYNAMIC LINK INIT: ${JSON.stringify(link)}`)
      if (link.url) {
        const isNavigated = await handleDynamicLink(link.url, navigation)
        if (isNavigated) {
          return
        }
      }
    }

    // Logged in?
    if (!user.isLoggedIn) {
      if (!user.introShown) {
        user.setIntroShown(true)
        navigation.navigate('intro')
      } else {
        navigation.navigate('onBoarding')
      }
      return
    }

    // Network connected? || Is autofill?
    if (!connectionState.isConnected) {
      goLockOrCreatePassword()
      return
    }

    if (user.onPremiseUser) {
      const res = await user.onPremisePreLogin({ email: user.email })
      if (res.kind === 'ok') {
        if (res.data[0].activated) {
          navigation.navigate('lock', {
            type: LockType.OnPremise,
            data: res.data[0],
            email: user.email,
          })
        } else {
          navigation.navigate('login')
        }
        return
      }
    }

    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    if (
      ['ok', 'unauthorized'].includes(userRes.kind) &&
      ['ok', 'unauthorized'].includes(userPwRes.kind)
    ) {
      goLockOrCreatePassword()
    } else {
      navigation.navigate('login')
    }
  }
  // ------------------ EFFECTS ---------------------

  // NOTE: dont change this effect to navigation onFocus or it will mess up handleDynamicLink
  useEffect(() => {
    mounted()
  }, [])

  // ------------------ RENDER ---------------------

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isRooted && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <Text
            text={translate('error.rooted_device')}
            style={{
              textAlign: 'center',
            }}
          />
        </View>
      )}
      {!isRooted && <Loading />}
    </View>
  )
})
