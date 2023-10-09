import React, { FC } from 'react'
import { View, Image, ColorValue } from 'react-native'
import LottieView from 'lottie-react-native'
import { Screen, Text, Button, Icon } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { AppStackScreenProps } from 'app/navigators'
import { translate } from 'app/i18n'
import { observer } from 'mobx-react-lite'

const LOTTIE_JSON = require('app/static/welcome-premium-bg-lottie.json')
const HIGH_FIVE = require('assets/images/welcomePremium/HighFive.png')
const PREMIUM = require('assets/images/welcomePremium/LockerPremium.png')

export const WelcomePremiumScreen: FC<AppStackScreenProps<'welcome_premium'>> = observer((props) => {
  const navigation = props.navigation
  const { colors } = useTheme()

  const backgroundSecondary: ColorValue = '#21632F'

  const UnlockFeature = ({ text }) => {
    return (
      <View style={{ flexDirection: 'row', marginVertical: 4, alignItems: 'center' }}>
        <Icon icon="check" color={colors.white} size={16} />
        <Text
          text={text}
          color={colors.white}
          style={{
            marginLeft: 5,
          }}
        />
      </View>
    )
  }

  return (
    <Screen padding backgroundColor={colors.primary}>
      <LottieView
        source={LOTTIE_JSON}
        style={{
          zIndex: 2,
          height: '100%',
          position: 'absolute',
        }}
        autoPlay
        loop
      />
      <View style={{ zIndex: 1, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={PREMIUM}
          style={{
            width: 152,
            height: 32,
          }}
        />
        <Image
          source={HIGH_FIVE}
          style={{
            marginTop: 24,
            width: 155,
            height: 163,
          }}
        />

        <Text
          preset="bold"
          text={translate('welcome_premium.title')}
          size="xl"
          style={{
            marginTop: 24,
            color: colors.white,
            textAlign: 'center',
          }}
        />
        <Text
          text={translate('welcome_premium.all_features')}
          style={{
            marginTop: 16,
            color: colors.white,
            textAlign: 'center',
          }}
        />

        <View
          style={{
            maxWidth: 650,
            marginTop: 16,
            borderRadius: 10,
            width: '100%',
            backgroundColor: backgroundSecondary,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <UnlockFeature text={translate('welcome_premium.features.unlimited')} />
          <UnlockFeature text={translate('welcome_premium.features.share')} />
          <UnlockFeature text={translate('welcome_premium.features.monitor')} />
          <UnlockFeature text={translate('welcome_premium.features.emergency')} />

          <Text
            text={translate('welcome_premium.features.more')}
            style={{
              color: colors.white,
            }}
          />
        </View>
      </View>

      <Button
        text={translate('welcome_premium.btn')}
        onPress={() => {
          navigation.navigate('mainTab')
        }}
        style={{
          zIndex: 3,
          width: '100%',
          marginTop: 20,
          backgroundColor: colors.primary,
        }}
        textStyle={{
          fontWeight: 'bold',
          color: colors.primary,
        }}
      />
    </Screen>
  )
})
