import React, { useRef, useState } from "react"
import { Dimensions, StyleSheet } from "react-native"
import { LanguagePicker } from "../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { RootParamList } from "../../../navigators"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { AnimatedFooter } from "./animated-footer/animated-footer"
import { Screen } from "../../../components/cores/screen/screen"
import { Wave } from "./wave"
import { Intro1, Intro2, Intro3, Intro4 } from "./intro/intro"

const SCREEN_WIDTH = Dimensions.get("screen").width
const SCREEN_HEIGHT = Dimensions.get("screen").height

export const IntroScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RootParamList, "intro">>()

  const [index, setIndex] = useState(0)
  const scrollViewRef = useRef(null)

  const isPreview = route.params?.preview

  // ------------------ METHODS ---------------------
  const animIndex = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler((event) => {
    animIndex.value = event.contentOffset.x / SCREEN_WIDTH
  })

  const scrollTo = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    })
    setIndex(index)
  }

  const onMomentumScrollEnd = ({ nativeEvent }: any) => {
    const position = nativeEvent.contentOffset
    const _index = Math.round(position.x / SCREEN_WIDTH)
    setIndex(_index)
  }

  // ------------------ RENDER ---------------------

  return (
    <Screen
      safeAreaEdges={["top"]}
      contentContainerStyle={{
        flex: 1,
        justifyContent: "space-between",
      }}
    >
      <LanguagePicker />
      <Wave color={"#Dbf5dd"} style={StyleSheet.absoluteFill} />

      <Animated.ScrollView
        horizontal
        style={{
          marginTop: 68,
        }}
        pagingEnabled
        onMomentumScrollEnd={onMomentumScrollEnd}
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        <Intro1 onView={index === 0} />
        <Intro2 onView={index === 1}/>
        <Intro3 onView={index === 2}/>
        <Intro4 onView={index === 3}/>
      </Animated.ScrollView>
      <AnimatedFooter animIndex={animIndex} index={index} scrollTo={scrollTo} />
    </Screen>
  )
})
