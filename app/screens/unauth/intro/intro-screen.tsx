import React, { useState, useRef } from "react"
import { View, Dimensions, Animated, TouchableOpacity } from "react-native"
import { AutoImage as Image, Text, Layout, Button, LanguagePicker } from "../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { fontSize, spacing } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { useAdaptiveLayoutMixins } from "../../../services/mixins/adaptive-layout"
import { observer } from "mobx-react-lite"
import { APP_INTRO } from "../../../common/mappings"
import { RootParamList } from "../../../navigators"

type IntroScreenProp = RouteProp<RootParamList, "intro">

export const IntroScreen = observer(() => {
  const { translate, color } = useMixins()
  const navigation = useNavigation()
  const route = useRoute<IntroScreenProp>()
  const { isPortrait } = useAdaptiveLayoutMixins()
  const { width, height } = Dimensions.get('screen')

  // ------------------ PARAMS ---------------------

  const [index, setIndex] = useState(0)

  // ------------------ CONPUTED ---------------------

  const isPreview = route.params?.preview

  // ------------------ DATA ---------------------

  const flastListRef = useRef(null)
  const tabs = [
    {
      img: APP_INTRO.security,
      title: translate('intro.security.title'),
      desc: translate('intro.security.desc')
    },
    {
      img: APP_INTRO.sync,
      title: translate('intro.sync.title'),
      desc: translate('intro.sync.desc')
    },
    {
      img: APP_INTRO.autofill,
      title: translate('intro.autofill.title'),
      desc: translate('intro.autofill.desc')
    },
    {
      img: APP_INTRO.otp,
      title: translate('intro.otp.title'),
      desc: translate('intro.otp.desc')
    }
  ]

  // ------------------ METHODS ---------------------

  const onViewableItemsChanged = useRef(({ viewableItems, _ }) => {
    setIndex(viewableItems[0].index)
  })

  const scrollTo = (index: number) => {
    setIndex(index)
    flastListRef.current?.scrollToIndex({ Animated: false, index })
  }

  // ------------------ RENDER ---------------------

  return (
    <Layout
      noScroll
      footer={
        <Button
          text={index === 3 ? translate("common.get_start") : translate("common.next")}
          onPress={() => {
            if (index === 3) {
              if (isPreview) {
                navigation.goBack()
              } else {
                navigation.navigate("onBoarding")
              }
            } else {
              scrollTo(index + 1)
            }
          }}
        />
      }
    >
      <LanguagePicker />
      <Button
        text={translate('common.skip').toUpperCase()}
        textStyle={{ fontSize: fontSize.p }}
        preset="link"
        onPress={() => {
          if (isPreview) {
            navigation.navigate("mainStack", {screen: "menu"})
          } else {
            navigation.navigate("onBoarding")
          }
        }}
        style={{ position: "absolute", top: 16, right: 20, zIndex: 11 }}
      >
      </Button>

      {/** Intro */}
      <Animated.FlatList
        data={tabs}
        ref={flastListRef}
        // @ts-ignore
        onViewableItemsChanged={onViewableItemsChanged.current}
        contentContainerStyle={{ height: height * 0.7 }}
        keyExtractor={(_, index) => `intro${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        viewabilityConfig={{
          waitForInteraction: true,
          viewAreaCoveragePercentThreshold: 50
        }}
        getItemLayout={(data, index) => (
          { length: width, offset: width * index, index }
        )}
        renderItem={({ item }) => (
          <View style={{
            width: width,
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <View />
            {
              isPortrait && <View style={{
                maxWidth: width * 0.9,
                marginBottom: 16,
                marginTop: "10%"
              }}
              >
                <Text preset="header" text={item.title} style={{
                  alignSelf: "center",
                  marginBottom: 10,
                }} />
                <Text text={item.desc} style={{
                  textAlign: "center"
                }} />
              </View>
            }

            <Image
              source={item.img}
              resizeMode="contain"
              style={{
                width: Math.min(width, 400),
                maxHeight: Math.min(width, 400)
              }}
            />
          </View>
        )}
      />

      {/* Bullets */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', flex: 1 }}>
        {
          tabs.map((item, i) =>
            <TouchableOpacity
              key={i}
              style={{
                height: 8,
                width: 8,
                borderRadius: 8,
                marginVertical: spacing.medium,
                marginHorizontal: spacing.tiny,
                backgroundColor: i === index ? color.primary : color.line
              }}
              onPress={() => setIndex(i)}
            />
          )
        }
      </View>
    </Layout>
  )
})
