import { StyleSheet, View, ViewStyle } from "react-native"
import Animated, { SharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "app/components/cores"

import { AnimatedTitle } from "./AnimatedText"
import { AnimatedTabIndicator } from "./Indicator"

interface Props {
  animIndex: SharedValue<number>
  scrollTo: (index: number) => void
  index: number
  goStart: () => void
}
const INTRO_LENGTH = 4

export const AnimatedFooter = ({ animIndex, scrollTo, index, goStart }: Props) => {
  const insets = useSafeAreaInsets()
  const goNext = () => {
    if (index < INTRO_LENGTH - 1) {
      scrollTo(index + 1)
    } else {
      goStart()
    }
  }

  // -------------RENDER-----------------

  return (
    <Animated.View style={[styles.container, { paddingBottom: insets.bottom + 6 }]}>
      {/** Display intro content */}
      <AnimatedTitle animIndex={animIndex} />

      <View style={$actionContainer}>
        <View style={$rowCenter}>
          {[0, 1, 2, 3].map((val) => (
            <AnimatedTabIndicator key={val} {...{ animIndex, val }} />
          ))}
        </View>
      </View>
      <Button tx={index !== 3 ? "common:next" : "common:get_start"} onPress={goNext} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: "35%",
    paddingHorizontal: 26,
  },
})

const $actionContainer: ViewStyle = {
  flex: 1,
  justifyContent: "flex-end",
  alignItems: "center",
  paddingBottom: 20,
}

const $rowCenter: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}
