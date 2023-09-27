import React, { FC } from 'react'
import { View, Image } from 'react-native'
import { AppStackScreenProps } from 'app/navigators'
import { Text, Button, Screen } from 'app/components/cores'

const SWITCH = require('assets/images/switch-devices.png')

export const SwitchDeviceScreen: FC<AppStackScreenProps<'switchDevice'>> = (props) => {
  const navigation = props.navigation

  // Methods
  const handleSwitchDevice = () => {
    navigation.navigate('mainTab', { screen: 'homeTab' })
  }

  const handleBuyPremium = () => {
    navigation.navigate('payment')
  }

  return (
    <Screen padding preset="auto" safeAreaEdges={['top']}>
      <View style={{ alignItems: 'center', paddingTop: '5%' }}>
        <Image source={SWITCH} />

        <Text preset="bold" size="xl" style={{ marginBottom: 10, marginTop: 30 }}>
          2 device switches left
        </Text>

        <Text style={{ textAlign: 'center' }}>Active device type:</Text>

        <Text preset="bold">Computer</Text>

        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          You can only use Locker for free one type of device. Switch up to 3 times to find the
          right option for you.
        </Text>

        <Button
          text="Switch to mobile"
          onPress={handleSwitchDevice}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 10,
          }}
        />

        <Button
          preset="secondary"
          text="Go Premium for unlimited access"
          onPress={handleBuyPremium}
          style={{
            width: '100%',
          }}
        />
      </View>
    </Screen>
  )
}
