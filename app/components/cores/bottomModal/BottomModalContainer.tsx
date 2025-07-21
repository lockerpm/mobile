import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { Dimensions, ScrollView, StyleSheet, View, ViewProps, ViewStyle } from "react-native"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

const height = Dimensions.get("window").height

type BottomModalContainerProps = ViewProps & {
  preset?: "default" | "scrollable"
}

const ScrollContent = (props: ViewProps) => {
  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.handleContainer} />
      <View {...props} />
    </ScrollView>
  )
}

const StaticContent = (props: ViewProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.handleContainer} />
      <View {...props} />
    </View>
  )
}

export const BottomModalContainer = ({
  preset = "scrollable",
  ...props
}: BottomModalContainerProps) => {
  const { themed } = useAppTheme()

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={themed($container)}>
      {preset === "default" ? <StaticContent {...props} /> : <ScrollContent {...props} />}
    </Animated.View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 6,
  backgroundColor: colors.background,
})

const styles = StyleSheet.create({
  container: {
    maxHeight: height * 0.8,
  },
  handleContainer: {
    alignItems: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: 12,
    justifyContent: "center",
    paddingVertical: 4,
  },
})
