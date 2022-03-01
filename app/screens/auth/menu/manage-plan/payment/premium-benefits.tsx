import React, { useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { AutoImage as Image, Text, Layout, Button } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { TabView, SceneMap } from 'react-native-tab-view';
import { useMixins } from "../../../../../services/mixins"


export const PremiumBenefits = function PremiumBenefits() {
  const { translate, color } = useMixins()
  const navigation = useNavigation()

  const tabs = [
    {
      img: require("./intro.png"),
      desc: "Unlimited Passwords, Secure Notes, Payment Cards, Identities, Crypto Assets"
    },
    {
      img: require("./intro.png"),
      desc: "Dark Web Monitoring protects your accounts from massive data breaches"
    },
    {
      img: require("./intro.png"),
      desc: "Emergency Contact let trusted accounts access your vault when needed"
    },
    {
      img: require("./intro.png"),
      desc: "Share Passwords and items securely with your friends and family members."
    }
  ]
  const map = {}

  const [index, setIndex] = useState(0)
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
        <Image source={item.img} style={{height:120, marginBottom: 30}} />
        <Text text={item.desc} style={{ textAlign: 'center', lineHeight: 24, maxWidth: 320 }} />
      </View>
    )
  })
  const renderScene = SceneMap(map)

  return (
      <View style={{ flex: 1, justifyContent: 'center', position: "absolute", width: "100%" }}>
        {/* Tabs */}
        <View style={{ flex: 3, minHeight: 300, maxHeight: 500 }}>
          <TabView
            renderTabBar={() => null}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
          />
        </View>

        {/* Bullets */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', flex: 1 }}>
          {
            routes.map((item, i) =>
              <TouchableOpacity
                key={i}
                style={{
                  height: 4,
                  width: 12,
                  borderRadius: 25,
                  marginVertical: 15,
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
