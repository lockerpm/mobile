import React, { useState } from "react"
import { View, TouchableOpacity, Image } from "react-native"
import { Text } from "../../../../../components"
// import { commonStyles, fontSize } from "../../../../../theme"
import { TabView, SceneMap } from 'react-native-tab-view';
import { useMixins } from "../../../../../services/mixins"


export const PremiumBenefits = (props: { benefitTab: number }) => {
  // console.log(props.benefitTab)
  const { translate, color } = useMixins()
  const tabs = [
    {
      img: require("../assets/Locker.png"),
      desc: translate("payment.benefit.locker")
    },
    {
      img: require("../assets/Web.png"),
      desc: translate("payment.benefit.web")
    },
    {
      img: require("../assets/EmergencyContact.png"),
      desc: translate("payment.benefit.emergency_contact")
    },
    {
      img: require("../assets/SharePassword.png"),
      desc: translate("payment.benefit.share_password")
    }
  ]
  const map = {}
  const [index, setIndex] = useState(props.benefitTab ?? 0)
  const [routes] = useState(tabs.map((item, index) => ({
    key: index.toString()
  })))

  tabs.forEach((item, i) => {
    map[i.toString()] = () => {

      return (
        <View
          key={i}
          style={{
            marginTop: "5%",
            width: "100%",
            height: "95%",
            alignItems: 'center',
            flexDirection: "column",
            justifyContent: "space-around",
            padding: 5
          }}
        >
          <Image key={i} defaultSource={item.img} source={item.img} style={{ maxHeight: "60%" }} resizeMode="contain" />
          <Text preset="black" text={item.desc} style={{ textAlign: 'center', lineHeight: 24, maxWidth: "90%" }} />
        </View>
      )
    }
  })
  const renderScene = SceneMap(map)

  return (
    <View style={{ width: "100%" }}>
      {/* Tabs */}
      <View style={{ height: "100%", paddingBottom: 10 }}>
        <TabView
          renderTabBar={() => null}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
        />
      </View>

      {/* Bullets */}
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {
          routes.map((item, i) =>
            <TouchableOpacity
              key={i}
              style={{
                height: 4,
                width: 15,
                borderRadius: 25,
                marginHorizontal: 4,
                backgroundColor: i === index ? color.primary : color.palette.gray
              }}
              onPress={() => setIndex(i)}
            />
          )
        }
      </View>
    </View>
  )
}
