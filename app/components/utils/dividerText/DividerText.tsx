import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { TextProps, Text } from "app/components/cores"
import { StyleProp, View, ViewStyle } from "react-native"

interface Props extends TextProps {
  containerStyle?: StyleProp<ViewStyle>
}
export const DividerText = ({ containerStyle, ...textStyle }: Props) => {
  const { themed } = useAppTheme()

  return (
    <View style={[$container, containerStyle]}>
      <View style={themed($divider)} />
      <Text {...textStyle} />
      <View style={themed($divider)} />
    </View>
  )
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  height: 1,
  backgroundColor: colors.border,
})

const $container: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
}
