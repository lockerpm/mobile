import { observer } from "mobx-react-lite"
import React from "react"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import Animated, { FadeIn } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Icon, Text } from "../../../../components/cores"
import { useMixins } from "../../../../services/mixins"
import { AnimatedTitle } from "./animated-text"
import { AnimatedTabIndicator } from "./indicator"

interface Props {
  animIndex: Animated.SharedValue<number>
  scrollTo: (index: number) => void
  index: number
}
const INTRO_LENGTH = 4

export const AnimatedFooter = observer(({ animIndex, scrollTo, index }: Props) => {
  const { color, translate } = useMixins()
  const insert = useSafeAreaInsets()

  const goNext = () => {
    if (index < INTRO_LENGTH - 1) {
      scrollTo(index + 1)
    }
  }
  const goBack = () => {
    if (index > 0) {
      scrollTo(index - 1)
    }
  }

  // -------------RENDER-----------------

  return (
    <Animated.View
      style={{
        height: "30%",
        paddingHorizontal: 26,
        paddingBottom: insert.bottom + 10,
      }}
    >
      {/** Display intro content */}
      <AnimatedTitle animIndex={animIndex} />

      <View style={$actionContainer}>
        <View style={$rowSpace}>
          {/** Move back intro */}
          <TouchableOpacity
            onPress={goBack}
            style={{
              justifyContent: "center",
              paddingRight: 25,
              minWidth: 49,
            }}
          >
            {index !== 0 && (
              <Animated.View entering={FadeIn}>
                <Icon icon="caret-left" size={24} color={color.primary} />
              </Animated.View>
            )}
          </TouchableOpacity>
          <View style={$rowCenter}>
            {[0, 1, 2, 3].map((val) => (
              <AnimatedTabIndicator
                key={val}
                onPress={() => {
                  scrollTo(val)
                }}
                {...{ animIndex, val }}
              />
            ))}
          </View>

          {/** Go next intro */}
          <TouchableOpacity
            onPress={goNext}
            style={[$goNextStyle, { backgroundColor: color.primary }]}
          >
            <Text
              text={index !== 3 ? translate("common.next") : translate("common.get_start")}
              color={color.white}
              style={{
                textAlign: "center",
                fontWeight: "500",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
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
