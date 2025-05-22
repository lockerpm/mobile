import { useTheme } from "app/services/context"
import React from "react"
import { StyleSheet, View, ViewProps } from "react-native"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

export const ModalHOC = (props: ViewProps) => {
  const { colors } = useTheme()
  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.handleContainer} />
      <View {...props} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
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
