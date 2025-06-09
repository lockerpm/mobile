import { useTheme } from "app/services/context"
import React from "react"
import { Dimensions, ScrollView, StyleSheet, View, ViewProps } from "react-native"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

const height = Dimensions.get("window").height

export const BottomModalContainer = (props: ViewProps) => {
  const { colors } = useTheme()
  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{
          maxHeight: height * 0.8,
        }}
      >
        <View style={styles.handleContainer} />
        <View {...props} />
      </ScrollView>
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
