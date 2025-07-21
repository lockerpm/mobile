import { FC, useRef, useState } from "react"
import { Dimensions, StyleSheet } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { AnimatedFooter } from "./animatedFooter/AnimatedFooter"
import { Wave } from "./Wave"
import { Intro1, Intro2, Intro3, Intro4 } from "./intro/Intro"
import { UnAuthScreenProps } from "app/navigators"
import { useStores } from "app/models"
import { Screen } from "@/components/cores"

const SCREEN_WIDTH = Dimensions.get("screen").width

export const IntroScreen: FC<UnAuthScreenProps<"intro">> = ({ navigation }) => {
  const { uiStore } = useStores()

  // ------------------ PARAMS ---------------------
  const [index, setIndex] = useState(0)
  const scrollViewRef = useRef<Animated.ScrollView>(null)

  // ------------------ METHODS ---------------------
  const animIndex = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler((event) => {
    animIndex.value = event.contentOffset.x / SCREEN_WIDTH
  })

  const goStart = () => {
    uiStore.setIsShowedAppIntro(true)
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
    <Screen disableAvoidkeyboard safeAreaEdges={["top"]} contentContainerStyle={styles.container}>
      <Wave color={"#Dbf5dd"} style={StyleSheet.absoluteFill} />

      <Animated.ScrollView
        horizontal
        style={styles.contentContainer}
        pagingEnabled
        scrollEnabled={false}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  contentContainer: {
    marginTop: 68,
  },
})
