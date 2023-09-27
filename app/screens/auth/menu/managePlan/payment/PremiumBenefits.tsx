import React, { useState } from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { TabView, SceneMap } from 'react-native-tab-view'
import { PREMIUM_FEATURES_IMG } from '../PremiumFeature'
import { Text } from 'app/components-v2/cores'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'

export const PremiumBenefits = (props: { benefitTab: number }) => {
  const { colors } = useTheme()
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
  const map = {}
  const [index, setIndex] = useState(props.benefitTab ?? 0)
  const [routes] = useState(
    tabs.map((item, index) => ({
      key: index.toString(),
    }))
  )

  tabs.forEach((item, i) => {
    map[i.toString()] = () => {
      return (
        <View
          key={i}
          style={{
            marginTop: '5%',
            width: '100%',
            height: '95%',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'space-around',
            padding: 5,
          }}
        >
          <Image
            key={i}
            defaultSource={item.img}
            source={item.img}
            style={{ maxHeight: '60%' }}
            resizeMode="contain"
          />
          <Text text={item.desc} style={{ textAlign: 'center', lineHeight: 24, maxWidth: '90%' }} />
        </View>
      )
    }
  })
  const renderScene = SceneMap(map)

  return (
    <View style={{ width: '100%' }}>
      {/* Tabs */}
      <View style={{ height: '100%', paddingBottom: 10 }}>
        <TabView
          renderTabBar={() => null}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
        />
      </View>

      {/* Bullets */}
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {routes.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={{
              height: 4,
              width: 15,
              borderRadius: 25,
              marginHorizontal: 4,
              backgroundColor: i === index ? colors.primary : colors.block,
            }}
            onPress={() => setIndex(i)}
          />
        ))}
      </View>
    </View>
  )
}
