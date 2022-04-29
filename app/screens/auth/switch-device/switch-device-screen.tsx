import React from "react"
import { observer } from "mobx-react-lite"
import { AutoImage as Image, Text, Button, Layout } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { View } from "react-native"

export const SwitchDeviceScreen = observer(function SwitchDeviceScreen() {
  const navigation = useNavigation()

  // Methods
  const handleSwitchDevice = () => {
    navigation.navigate('mainTab', { screen: 'homeTab' })
  }

  const handleBuyPremium = () => {}

  return (
    <Layout>
      <View style={{ alignItems: 'center', paddingTop: '5%' }}>
        <Image source={require("./switch.png")} />

        <Text
          preset="header"
          style={{ marginBottom: 10, marginTop: 30 }}
        >
          2 device switches left
        </Text>

        <Text style={{ textAlign: 'center' }}>
          Active device type: 
        </Text>

        <Text preset="bold">
          Computer
        </Text>

        <Text style={{ textAlign: 'center', marginTop: 10 }}>
        You can only use Locker for free one type of device. Switch up to 3 times to find the right option for you. 
        </Text>

        <Button
          text="Switch to mobile"
          onPress={handleSwitchDevice}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 10
          }}
        />

        <Button
          preset="outline"
          text="Go Premium for unlimited access"
          onPress={handleBuyPremium}
          style={{
            width: '100%'
          }}
        />
      </View>
    </Layout>
  )
})
