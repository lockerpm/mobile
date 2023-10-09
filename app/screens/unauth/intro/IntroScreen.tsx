import React, { FC, useRef, useState } from "react"
import { Dimensions, StyleSheet } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { RootStackScreenProps } from "app/navigators"
import { Icon, Screen } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { AnimatedFooter } from "./animatedFooter/AnimatedFooter"
import { Wave } from "./Wave"
import { Intro1, Intro2, Intro3, Intro4 } from "./intro/Intro"

const SCREEN_WIDTH = Dimensions.get("screen").width

export const IntroScreen: FC<RootStackScreenProps<"intro">> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const [index, setIndex] = useState(0)
  const scrollViewRef = useRef(null)

  const isPreview = route.params?.preview

  // ------------------ METHODS ---------------------
  const animIndex = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler((event) => {
    animIndex.value = event.contentOffset.x / SCREEN_WIDTH
  })

  const goStart = () => {
    navigation.navigate("onBoarding")
  }

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
      {isPreview && (
        <Icon
          onPress={() => {
            navigation.goBack()
          }}
          icon="arrow-left"
          size={24}
          style={{ zIndex: 10, position: "absolute", left: 20, top: 16 }}
        />
      )}

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
        <Intro2 onView={index === 1} />
        <Intro3 onView={index === 2} />
        <Intro4 onView={index === 3} />
      </Animated.ScrollView>
      <AnimatedFooter animIndex={animIndex} index={index} scrollTo={scrollTo} goStart={goStart} />
    </Screen>
  )
})
