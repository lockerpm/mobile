import * as React from "react"
import { StyleProp, View, ViewStyle, ActivityIndicator, StyleSheet } from "react-native"
import { Text } from "../../cores"
import { useTheme } from "app/services/context"

export interface LoadingProps {
  style?: StyleProp<ViewStyle>
  message?: string
}

/**
 * Describe your component here
 */
export const Loading = function Loading(props: LoadingProps) {
  const { style, message } = props
  const { colors } = useTheme()
  return (
    <View
      style={[
        styles.container,
        style,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {!!message && (
        <Text
          text={message}
          style={{
            marginTop: 10,
          }}
        />
      )}
    </View>
  )
}

export const OverlayLoading = function OverlayLoading(props: LoadingProps) {
  const { style } = props
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.overlayContainer,
        style,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  overlayContainer: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "center",
    left: 0,
    opacity: 0.8,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 1000,
  },
})
