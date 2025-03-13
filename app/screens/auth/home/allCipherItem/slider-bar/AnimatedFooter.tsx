import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { View, ViewStyle } from "react-native"
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated"

import { useTheme } from "app/services/context"

interface Props {
  length: number
  animIndex: Animated.SharedValue<number>
}

export const AnimatedFooter = observer(({ animIndex, length }: Props) => {
  const data = useMemo(() => new Array(length).fill(0).map((_, index) => index), [length])

  return (
    <View style={$actionContainer}>
      <View style={$rowCenter}>
        {data.map((val) => (
          <AnimatedTabIndicator key={val} {...{ animIndex, val }} />
        ))}
      </View>
    </View>
  )
})

interface ContentProps {
  val: number
  animIndex: Animated.SharedValue<number>
}
export const AnimatedTabIndicator = ({ val, animIndex }: ContentProps) => {
  const { colors } = useTheme()
  const $contentStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(animIndex.value, [val - 1, val, val + 1], [8, 20, 8], Extrapolate.CLAMP),
      backgroundColor: interpolateColor(
        animIndex.value,
        [val - 1, val, val + 1],
        [colors.secondaryText, colors.primary, colors.secondaryText],
      ),
    }
  })

  return (
    <Animated.View
      style={[
        {
          marginHorizontal: 6,
          height: 8,
          width: 8,
          borderRadius: 4,
          backgroundColor: colors.white,
        },
        $contentStyle,
      ]}
    />
  )
}

const $actionContainer: ViewStyle = {
  flex: 1,
  alignItems: "center",
}

const $rowCenter: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}
