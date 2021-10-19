import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { AutoImage as Image, Text, Button, Layout } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { View } from "react-native"
import { save, storageKeys } from "../../../utils/storage"


export const BiometricUnlockIntroScreen = observer(function BiometricUnlockIntroScreen() {
  const navigation = useNavigation()

  // Methods
  const handleUseBiometric = async () => {
    await save(storageKeys.APP_SHOW_BIOMETRIC_INTRO, 1)
    navigation.navigate('settings', { fromIntro: true })
  }

  const handleSkip = async () => {
    await save(storageKeys.APP_SHOW_BIOMETRIC_INTRO, 1)
    navigation.navigate('mainTab', { screen: 'homeTab' })
  }

  let isBacking = false
  useEffect(() => {
    const handleBack = (e) => {
      if (isBacking) {
        isBacking = false
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()
      isBacking = true
      navigation.navigate('mainTab', { screen: 'homeTab' })
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])

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
