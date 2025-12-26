import { Dimensions, ScrollView, StyleSheet, View, ViewProps, ViewStyle } from "react-native"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

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
  const insets = useSafeAreaInsets()

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[themed($container), { paddingBottom: insets.bottom + 6 }]}
    >
      {preset === "default" ? <StaticContent {...props} /> : <ScrollContent {...props} />}
    </Animated.View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
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
