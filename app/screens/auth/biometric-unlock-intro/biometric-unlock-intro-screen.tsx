import React from "react"
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
    navigation.navigate('mainTab')
  }

  return (
    <Layout>
      <View style={{ alignItems: 'center', paddingTop: '15%' }}>
        <Image source={require("./faceid.png")} />

        <Text
          preset="header"
          tx={"biometric_intro.title"}
          style={{ marginBottom: 10, marginTop: 30 }}
        />

        <Text
          style={{ textAlign: 'center', maxWidth: 250 }}
          tx={"biometric_intro.desc"}
        />

        <Button
          isNativeBase
          tx={"biometric_intro.use_btn"}
          onPress={handleUseBiometric}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 10
          }}
        />

        <Button
          isNativeBase
          variant="ghost"
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
