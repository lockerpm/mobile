import React from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, TouchableOpacity } from "react-native"
import { AutoImage as Image, Button, Text, Layout } from "../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../../theme"
import { TabView, SceneMap } from 'react-native-tab-view';


const SECTION_PADDING: ViewStyle = {
  paddingVertical: spacing[2],
  paddingHorizontal: spacing[4]
}

export const IntroScreen = observer(function IntroScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  const tabs = [
    {
      img: require("./intro.png"),
      title: 'Trusted and secure',
      desc: 'Your vault is protected with world-class security. It’s so secure, not even we can access your passwords.'
    },
    {
      img: require("./intro.png"),
      title: 'Trusted and secure',
      desc: 'Your vault is protected with world-class security. It’s so secure, not even we can access your passwords.'
    },
    {
      img: require("./intro.png"),
      title: 'Trusted and secure',
      desc: 'Your vault is protected with world-class security. It’s so secure, not even we can access your passwords.'
    }
  ]

  const [index, setIndex] = React.useState(0)
  const [routes] = React.useState(tabs.map((item, index) => ({
    key: index.toString()
  })))

  const map = {}
  tabs.forEach((item, index) => {
    // eslint-disable-next-line react/display-name
    map[index.toString()] = () => (
      <View
        key={index}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: 'center',
          paddingBottom: spacing[6],
          paddingHorizontal: spacing[5]
        }}
      >
        <Image source={item.img} />
        <Text preset="header" text={item.title} style={{
          marginTop: 30,
          marginBottom: 10
        }} />
        <Text text={item.desc} style={{ textAlign: 'center', lineHeight: 24 }} />
      </View>
    )
  })
  const renderScene = SceneMap(map)

  const header = () => (
    <View style={[SECTION_PADDING, { alignItems: "flex-end" }]}>
      <Button
        preset="link"
        text="SKIP"
        textStyle={{ color: color.palette.green, fontSize: 14 }}
        onPress={() => navigation.navigate("onBoarding")}
      />
    </View>
  )

  const footer = () => (
    <View style={SECTION_PADDING}>
      <Button
        tx="welcomeScreen.continue"
        onPress={() => {
          if (index === routes.length - 1) {
            navigation.navigate("onBoarding")
          } else {
            setIndex((index + 1) % routes.length)
          }
        }}
      />
    </View>
  )

  return (
    <Layout
      header={header}
      footer={footer}
      noScroll
    >
      <View style={{ flex: 1 }}>
        <View style={{ flex: 3 }}>
          <TabView
            lazy
            renderTabBar={() => null}
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
          />
        </View>

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
                  backgroundColor: i === index ? color.palette.green : color.palette.lightGray
                }}
                onPress={() => setIndex(i)}
              />
            )
          }
        </View>
      </View>
    </Layout>
  )
})
