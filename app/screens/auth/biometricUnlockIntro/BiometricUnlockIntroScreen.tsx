import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { View, Image, TouchableOpacity } from 'react-native'
import ReactNativeBiometrics from 'react-native-biometrics'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { translate } from 'app/i18n'
import { AutofillDataType, loadShared, saveShared } from 'app/utils/keychain'

import { Button, Screen, Text } from 'app/components/cores'

const FACEID = require('assets/images/intro/faceid.png')

export const BiometricUnlockIntroScreen = () => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { isBiometricAvailable, notify } = useHelper()

  // ----------------------- PARAMS ----------------------

  const [isLoading, setIsLoading] = useState(false)

  // ----------------------- METHODS ----------------------

  const handleUseBiometric = async () => {
    setIsLoading(true)
    const available = await isBiometricAvailable()

    if (!available) {
      notify('error', translate('error.biometric_not_support'))
      setIsLoading(false)
      return
    }

    const { success } = await ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Verify FaceID/TouchID',
    })
    if (!success) {
      notify('error', translate('error.biometric_unlock_failed'))
      setIsLoading(false)
      return
    }

    user.setBiometricUnlock(true)
    await _updateAutofillFaceIdSetting(true)
    notify('success', translate('success.biometric_enabled'))
    user.setBiometricIntroShown(true)
    setIsLoading(false)
    navigation.navigate('mainTab', { screen: user.defaultTab })
  }

  const handleSkip = async () => {
    user.setBiometricIntroShown(true)
    navigation.navigate('mainTab', { screen: 'homeTab' })
  }

  const _updateAutofillFaceIdSetting = async (enabled: boolean) => {
    const credentials = await loadShared()
    if (credentials && credentials.password) {
      const sharedData: AutofillDataType = JSON.parse(credentials.password)
      sharedData.faceIdEnabled = enabled
      await saveShared('autofill', JSON.stringify(sharedData))
    }
  }

  // ----------------------- EFFECT ----------------------

  useEffect(() => {
    const handleBack = (e) => {
      if (!['POP', 'GO_BACK'].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()
      navigation.navigate('mainTab', { screen: 'homeTab' })
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])

  // ----------------------- RENDER ----------------------

  return (
    <Screen padding safeAreaEdges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', paddingTop: '5%' }}>
        <Image source={FACEID} style={{ height: 216, width: 242 }} />

        <Text
          preset="bold"
          size="xl"
          tx={'biometric_intro.title'}
          style={{ marginBottom: 10, marginTop: 30, textAlign: 'center' }}
        />

        <Text style={{ textAlign: 'center', maxWidth: 250 }} tx={'biometric_intro.desc'} />

        <Button
          disabled={isLoading}
          loading={isLoading}
          text={translate('biometric_intro.use_btn')}
          onPress={handleUseBiometric}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 10,
          }}
        />

        <TouchableOpacity
          onPress={handleSkip}
          style={{
            width: '100%',
          }}
        >
          <Text preset="bold" text={translate('biometric_intro.later_btn')} />
        </TouchableOpacity>
      </View>
    </Screen>
  )
}
