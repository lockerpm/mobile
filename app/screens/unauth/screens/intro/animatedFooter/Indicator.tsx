import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { ViewStyle } from "react-native"
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated"

interface ContentProps {
  val: number
  animIndex: Animated.SharedValue<number>
}
export const AnimatedTabIndicator = ({ val, animIndex }: ContentProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const $contentStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(animIndex.value, [val - 1, val, val + 1], [8, 20, 8], Extrapolate.CLAMP),
      backgroundColor: interpolateColor(
        animIndex.value,
        [val - 1, val, val + 1],
        [colors.white, colors.primary, colors.white]
      ),
    }
  }, [colors, val])

  return <Animated.View style={[themed([$container]), $contentStyle]} />
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 8,
  width: 8,
  borderRadius: 4,
  backgroundColor: colors.white,
  marginHorizontal: 6,
})
