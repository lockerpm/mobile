import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { AutoImage as Image, Text, Button, Layout } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { View } from "react-native"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import ReactNativeBiometrics from "react-native-biometrics"
import { AutofillDataType, loadShared, saveShared } from "../../../utils/keychain"


export const BiometricUnlockIntroScreen = observer(function BiometricUnlockIntroScreen() {
  const navigation = useNavigation()
  const { user } = useStores()
  const { isBiometricAvailable, notify, translate } = useMixins()

  // ----------------------- PARAMS ----------------------

  const [isLoading, setIsLoading] = useState(false)

  // ----------------------- METHODS ----------------------

  const handleUseBiometric = async () => {
    setIsLoading(true)
    const available = await isBiometricAvailable()
    setIsLoading(false)

    if (!available) {
      notify('error', translate('error.biometric_not_support'))
      return
    }

    const { success } = await ReactNativeBiometrics.simplePrompt({
      promptMessage: 'Verify FaceID/TouchID'
    })
    if (!success) {
      notify('error', translate('error.biometric_unlock_failed'))
      return
    }

    user.setBiometricUnlock(true)
    await _updateAutofillFaceIdSetting(true)
    notify('success', translate('success.biometric_enabled'))
    user.setBiometricIntroShown(true)
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
    <Layout>
      <View style={{ alignItems: 'center', paddingTop: '15%' }}>
        <Image source={require("./faceid.png")} style={{ height: 216, width: 242 }} />

        <Text
          preset="header"
          tx={"biometric_intro.title"}
          style={{ marginBottom: 10, marginTop: 30, textAlign: 'center' }}
        />

        <Text
          style={{ textAlign: 'center', maxWidth: 250 }}
          tx={"biometric_intro.desc"}
        />

        <Button
          isDisabled={isLoading}
          isLoading={isLoading}
          tx={"biometric_intro.use_btn"}
          onPress={handleUseBiometric}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 10
          }}
        />

        <Button
          preset="ghost"
          tx={"biometric_intro.later_btn"}
          onPress={handleSkip}
          style={{
            width: '100%'
          }}
        />
      </View>
    </Layout>
  )
})
