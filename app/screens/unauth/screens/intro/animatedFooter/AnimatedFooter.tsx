import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { Icon, Text } from "app/components/cores"
import { AnimatedTitle } from "./AnimatedText"
import { AnimatedTabIndicator } from "./Indicator"
import { useAppTheme } from "@/utils/useAppTheme"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

interface Props {
  animIndex: Animated.SharedValue<number>
  scrollTo: (index: number) => void
  index: number
  goStart: () => void
}
const INTRO_LENGTH = 4

export const AnimatedFooter = ({ animIndex, scrollTo, index, goStart }: Props) => {
  const { theme } = useAppTheme()

  const goNext = () => {
    if (index < INTRO_LENGTH - 1) {
      scrollTo(index + 1)
    } else {
      goStart()
    }
  }
  const goBack = () => {
    if (index > 0) {
      scrollTo(index - 1)
    }
  }

  // -------------RENDER-----------------

  return (
    <Animated.View style={styles.container}>
      {/** Display intro content */}
      <AnimatedTitle animIndex={animIndex} />

      <View style={$actionContainer}>
        <View style={$rowSpace}>
          {/** Move back intro */}
          <TouchableOpacity onPress={goBack} style={styles.moveBack}>
            {index !== 0 && (
              <Animated.View entering={FadeIn}>
                <Icon icon="caret-left" size={24} color={theme.colors.primary} />
              </Animated.View>
            )}
          </TouchableOpacity>
          <View style={$rowCenter}>
            {[0, 1, 2, 3].map((val) => (
              <AnimatedTabIndicator key={val} {...{ animIndex, val }} />
            ))}
          </View>

          {/** Go next intro */}
          <TouchableOpacity
            onPress={goNext}
            style={[$goNextStyle, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              tx={index !== 3 ? "common:next" : "common:get_start"}
              color={theme.colors.white}
              preset="bold"
              style={styles.centerText}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  container: {
    height: "35%",
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 10,
    paddingHorizontal: 26,
  },
  moveBack: {
    justifyContent: "center",
    minWidth: 49,
    paddingRight: 25,
  },
})

const $goNextStyle: ViewStyle = {
  height: 70,
  width: 70,
  borderRadius: 35,
  shadowColor: "#306966",
  shadowOffset: {
    width: 0,
    height: 10,
  },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 9,
  justifyContent: "center",
  alignContent: "center",
}

const $actionContainer: ViewStyle = {
  flex: 1,
  justifyContent: "flex-end",
}

const $rowCenter: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $rowSpace: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
}
