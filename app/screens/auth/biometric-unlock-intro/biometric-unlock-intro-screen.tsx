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
          style={{ marginBottom: 10, marginTop: 30 }}
        >
          Unlock vault with biometric
        </Text>

        <Text style={{ textAlign: 'center', maxWidth: 250 }}>
          Use face recognition or fingerprint to protect your passwords
        </Text>

        <Button
          isNativeBase
          text="Use Biometric"
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
          text="I’ll do it later"
          onPress={handleSkip}
          style={{
            width: '100%'
          }}
        />
      </View>
    </Layout>
  )
})
