import { ActivityIndicator, StyleSheet, ViewStyle } from "react-native"
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withTiming,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated"

import { useAppTheme } from "@/utils/useAppTheme"

import { Icon } from "../../cores"

export type PullRefreshState = "idle" | "refreshing" | "success"

type Props = {
  pullProgress: SharedValue<number>
  state: PullRefreshState
  topOffset: number
}

const SIZE = 44

export const PullRefreshIndicator = ({ pullProgress, state, topOffset }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = state !== "idle"
    const opacity = isActive
      ? withTiming(1, { duration: 150 })
      : interpolate(pullProgress.value, [0, 0.4, 1], [0, 1, 1])
    const scale = isActive
      ? withTiming(1, { duration: 200 })
      : interpolate(pullProgress.value, [0, 1], [0.4, 1])
    const translateY = isActive ? withTiming(60, { duration: 200 }) : pullProgress.value * 60
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    }
  })

  return state === "success" ? (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.circle,
        { top: topOffset, backgroundColor: colors.background, shadowColor: colors.text },
        animatedStyle,
      ]}
    >
      {state === "success" ? (
        <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(150)}>
          <Icon icon="check-circle" color={colors.success} size={20} />
        </Animated.View>
      ) : (
        <ActivityIndicator size="small" color={colors.label} />
      )}
    </Animated.View>
  ) : null
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: SIZE / 2,
    elevation: 4,
    height: SIZE,
    justifyContent: "center",
    position: "absolute",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    width: SIZE,
  } as ViewStyle,
})
