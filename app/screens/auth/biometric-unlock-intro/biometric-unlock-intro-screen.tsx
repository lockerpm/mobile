import React from "react"
import { observer } from "mobx-react-lite"
import { AutoImage as Image, Text, Button, Layout } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { View } from "react-native"


export const BiometricUnlockIntroScreen = observer(function BiometricUnlockIntroScreen() {
  const navigation = useNavigation()

  // Methods
  const handleUseBiometric = () => {}

  const handleSkip = () => {
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
          Unlock vault with Face ID
        </Text>

        <Text style={{ textAlign: 'center', maxWidth: 250 }}>
          Use face recognition to protect your passwords
        </Text>

        <Button
          isNativeBase
          text="Use Face ID"
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
