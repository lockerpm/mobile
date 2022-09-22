import React, { useState, useRef } from "react"
import { View, Dimensions, Animated, TouchableOpacity } from "react-native"
import { AutoImage as Image, Text, Layout, Button, LanguagePicker } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { fontSize, spacing } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { useAdaptiveLayoutMixins } from "../../../services/mixins/adaptive-layout"
import { observer } from "mobx-react-lite"
import { APP_INTRO } from "../../../common/mappings"


export const IntroScreen = observer(() => {
  const { translate, color } = useMixins()
  const navigation = useNavigation()
  const { isPortrait } = useAdaptiveLayoutMixins()
  const { width, height } = Dimensions.get('screen')

  // ------------------ PARAMS ---------------------

  const [index, setIndex] = useState(0)

  // ------------------ DATA ---------------------

  const flastListRef = useRef(null)
  const tabs = [
    {
      img: APP_INTRO.intro1,
      title: translate('intro.item_1.title'),
      desc: translate('intro.item_1.desc')
    },
    {
      img: APP_INTRO.intro2,
      title: translate('intro.item_2.title'),
      desc: translate('intro.item_2.desc')
    },
    {
      img: APP_INTRO.intro3,
      title: translate('intro.item_3.title'),
      desc: translate('intro.item_3.desc')
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
          text={index === 2 ? translate("common.get_start") : translate("common.next")}
          onPress={() => {
            if (index === 2) {
              navigation.navigate("onBoarding")
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
        onPress={() => navigation.navigate("onBoarding")}
        style={{ position: "absolute", top: 16, right: 20, zIndex: 11 }}
      >
      </Button>

      {/** Intro */}
      <Animated.FlatList
        data={tabs}
        ref={flastListRef}
        // @ts-ignore
        onViewableItemsChanged={onViewableItemsChanged.current}
        contentContainerStyle={{ height: height * 0.6 }}
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
            justifyContent: "flex-end"
          }}>
            <Image
              source={item.img}
              resizeMode="contain"
              style={{
                maxWidth: 300,
                maxHeight: 300
              }}
            />
            {
              isPortrait && <View style={{ maxWidth: width * 0.8 }} >
                <Text preset="header" text={item.title} style={{
                  alignSelf: "center",
                  marginBottom: 10,
                }} />
                <Text text={item.desc} style={{
                  textAlign: "center"
                }} />
              </View>
            }
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
