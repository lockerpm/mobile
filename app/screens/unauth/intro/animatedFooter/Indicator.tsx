import React from 'react'
import { TouchableOpacity } from 'react-native'
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useTheme } from 'app/services/context'

interface ContentProps {
  val: number
  animIndex: Animated.SharedValue<number>
  onPress: () => void
}
export const AnimatedTabIndicator = ({ val, animIndex, onPress }: ContentProps) => {
  const { colors } = useTheme()
  const $contentStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(animIndex.value, [val - 1, val, val + 1], [8, 20, 8], Extrapolate.CLAMP),
      backgroundColor: interpolateColor(
        animIndex.value,
        [val - 1, val, val + 1],
        [colors.white, colors.primary, colors.white]
      ),
    }
  })

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 6,
      }}
    >
      <Animated.View
        style={[
          {
            height: 8,
            width: 8,
            borderRadius: 4,
            backgroundColor: colors.white,
          },
          $contentStyle,
        ]}
      />
    </TouchableOpacity>
  )
}
