import React, { useState } from "react"
import { View, TouchableOpacity, Image} from "react-native"
import { Text } from "../../../../../components"
// import { commonStyles, fontSize } from "../../../../../theme"
import { TabView, SceneMap } from 'react-native-tab-view';
import { useMixins } from "../../../../../services/mixins"


export const PremiumBenefits = (props: {benefitTab: number}) => {
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
  const [index, setIndex] = useState(props.benefitTab?? 0)
  const [routes] = useState(tabs.map((item, index) => ({
    key: index.toString()
  })))

  tabs.forEach((item, index) => {
    map[index.toString()] = () => (
      <View
        key={index}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: 'center'
        }}
      >
        <View style={{ flex: 1 }}>
          <Image source={item.img} style={{ height: 180, width: 180 }} />
        </View>
        <Text preset="black" text={item.desc} style={{ textAlign: 'center', lineHeight: 24, maxWidth: 320, marginBottom: 5, color: "black" }} />
      </View>
    )
  })
  const renderScene = SceneMap(map)

  return (
    <View style={{ width: "100%" }}>
      {/* Tabs */}
      <View style={{ flexBasis: "70%", marginBottom: 5 }}>
        <TabView
          renderTabBar={() => null}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
        />
      </View>

      {/* Bullets */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
        {
          routes.map((item, i) =>
            <TouchableOpacity
              key={i}
              style={{
                height: 4,
                width: 12,
                borderRadius: 25,
                marginHorizontal: 4,
                backgroundColor: i === index ? color.primary : color.palette.lightGray
              }}
              onPress={() => setIndex(i)}
            />
          )
        }
      </View>
    </View>
  )
}
