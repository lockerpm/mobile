import React, { useState } from "react"
import { View, TouchableOpacity } from "react-native"
import { AutoImage as Image, Text, Layout, Button } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize, spacing } from "../../../theme"
import { TabView, SceneMap } from 'react-native-tab-view';
import { useMixins } from "../../../services/mixins"
import { useAdaptiveLayoutMixins } from "../../../services/mixins/adaptive-layout"

export const IntroScreen = () => {
  const { translate, color } = useMixins()
  const navigation = useNavigation()
  const { isPortrait, isTablet } = useAdaptiveLayoutMixins()

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
          flexDirection: isTablet ? "column" : isPortrait ? "column" : "row"
        }]}
      >
        <Image
          key={index}
          source={item.img}
          style={{
            flex: 7,
            maxWidth: "80%",
            maxHeight: "90%",
            alignSelf: "center"
          }}
        />
        {!(!isTablet && !isPortrait) && <View style={{
          flex: 2,
        }}>
          <Text preset="header" text={item.title} style={{
            flex: 1,
            alignSelf: "center",
          }} />
          <Text text={item.desc} style={{ textAlign: 'center',  flex: 1}} />
        </View>}

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
      <View style={{ flex: 1, justifyContent: 'center', marginBottom: 10 }}>
        {/* Tabs */}
        <View style={{ flex: 5, minHeight: 300 }}>
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
                  height: spacing.smaller,
                  width: spacing.smaller,
                  borderRadius: spacing.smaller,
                  marginVertical: spacing.medium,
                  marginHorizontal: spacing.tiny,
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
