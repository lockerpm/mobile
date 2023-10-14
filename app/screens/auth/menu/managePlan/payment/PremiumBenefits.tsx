import React from 'react'
import { View, Image, Dimensions } from 'react-native'
import { SwiperFlatList } from 'react-native-swiper-flatlist'
import { PREMIUM_FEATURES_IMG } from '../PremiumFeature'
import { Text } from 'app/components/cores'
import { useHelper } from 'app/services/hook'

const SCREEN_WIDTH = Dimensions.get('screen').width

export const PremiumBenefits = () => {
  const { translate } = useHelper()
  const tabs = [
    {
      img: PREMIUM_FEATURES_IMG.locker,
      desc: translate('payment.benefit.locker'),
    },
    {
      img: PREMIUM_FEATURES_IMG.web,
      desc: translate('payment.benefit.web'),
    },
    {
      img: PREMIUM_FEATURES_IMG.emergencyContact,
      desc: translate('payment.benefit.emergency_contact'),
    },
    {
      img: PREMIUM_FEATURES_IMG.sharePassword,
      desc: translate('payment.benefit.share_password'),
    },
  ]

  return (
    <SwiperFlatList
      autoplay
      autoplayDelay={2}
      autoplayLoop
      index={0}
      showPagination
      autoplayLoopKeepAnimation
      data={tabs}
      contentContainerStyle={{
        width: SCREEN_WIDTH,
        height: '40%',
      }}
      renderItem={({ item }) => (
        <View
          style={{
            width: SCREEN_WIDTH,
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'space-around',
            padding: 5,
          }}
        >
          <Image
            defaultSource={item.img}
            source={item.img}
            style={{ maxHeight: '60%' }}
            resizeMode="contain"
          />
          <Text text={item.desc} style={{ textAlign: 'center', lineHeight: 24, maxWidth: '90%' }} />
        </View>
      )}
    />
  )
}
