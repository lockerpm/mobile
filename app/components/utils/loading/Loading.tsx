import { StyleProp, View, ViewStyle, ActivityIndicator } from "react-native"
import { Text, TextProps } from "../../cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

export interface LoadingProps {
  /**
   * Custom container style
   */
  style?: StyleProp<ViewStyle>

  /**
   * Message to display below the loading indicator
   */
  tx?: TextProps["tx"]
}

/**
 * Describe your component here
 */
export const Loading = function Loading({ style, tx }: LoadingProps) {
  const { theme, themed } = useAppTheme()
  return (
    <View style={themed([$container, style])}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {!!tx && <Text tx={tx} style={themed($text)} />}
    </View>
  )
}

export const OverlayLoading = (props: LoadingProps) => {
  const { style } = props
  const { themed, theme } = useAppTheme()

  return (
    <View style={themed([$overlayContainer, style])}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  )
}

const $overlayContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
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
  backgroundColor: colors.background,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  backgroundColor: colors.background,
})

const $text: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})
