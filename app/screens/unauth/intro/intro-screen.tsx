import React, { useEffect, useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { AutoImage as Image, Text, Layout, Button } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../theme"
import { TabView, SceneMap } from 'react-native-tab-view';
import { useMixins } from "../../../services/mixins"
import { useOrientation, Orientation } from "../../../services/mixins/orientation"

export const IntroScreen = () => {
  const { translate, color } = useMixins()
  const navigation = useNavigation()
  const orientation = useOrientation()

  const tabs = [
    {
      img: require("./intro1.png"),
      title: translate('intro.item_1.title'),
      desc: translate('intro.item_1.desc')
    },
    {
      img: require("./intro2.png"),
      title: translate('intro.item_2.title'),
      desc: translate('intro.item_2.desc')
    },
    {
      img: require("./intro3.png"),
      title: translate('intro.item_3.title'),
      desc: translate('intro.item_3.desc')
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
        style={[commonStyles.SECTION_PADDING, {
          flex: 1,
          justifyContent: "space-around",
          alignContent: "center",
          alignItems: 'center',
          paddingHorizontal: 37,
          flexDirection: orientation == Orientation.LANDSCAPE ? "row" : "column"
        }]}
      >
        <Image
          key={index}
          source={item.img}
          style={{
            width: orientation == Orientation.LANDSCAPE ? 350 : "100%",
            maxWidth: 600,
            alignSelf: "center"
          }}
        />
        <View>
          <Text preset="header" text={item.title} style={{
            alignSelf: "center",
            marginTop: 16,
            marginBottom: 10
          }} />
          <Text text={item.desc} style={{ textAlign: 'center', lineHeight: 24, maxWidth: 300 }} />
        </View>

      </View>
    )
  })
  const renderScene = SceneMap(map)

  // Header
  const header = (
    <View style={{ alignItems: "flex-end" }}>
      <Button
        text={translate('common.skip').toUpperCase()}
        textStyle={{ fontSize: fontSize.p }}
        preset="link"
        onPress={() => navigation.navigate("onBoarding")}
      >
      </Button>
    </View>
  )

  // Footer
  const footer = (
    <View>
      <Button
        text={translate("common.continue")}
        onPress={() => {
          if (index === routes.length - 1) {
            navigation.navigate("onBoarding")
          } else {
            setIndex((index + 1) % routes.length)
          }
        }}
      >
      </Button>
    </View>
  )

  return (
    <Layout
      header={header}
      footer={footer}
      noScroll
    >
      <View style={{ flex: 1, justifyContent: 'center', marginBottom: 10}}>
        {/* Tabs */}
        <View style={{ flex: 3, minHeight: 300}}>
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
                  height: 8,
                  width: 8,
                  borderRadius: 8,
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
    </Layout>
  )
}
