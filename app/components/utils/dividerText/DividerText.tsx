import { TextProps, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"

interface Props extends TextProps {
  containerStyle?: StyleProp<ViewStyle>
}
export const DividerText = ({ containerStyle, ...textStyle }: Props) => {
  const { colors } = useTheme()

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        },
        containerStyle,
      ]}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.palette.neutral4 }} />
      <Text {...textStyle} />
      <View style={{ flex: 1, height: 1, backgroundColor: colors.palette.neutral4 }} />
    </View>
  )
}
