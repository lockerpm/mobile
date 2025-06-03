import { useTheme } from "app/services/context"
import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { Text } from "../../cores"

type PremiumTagProps = {
  style?: StyleProp<ViewStyle>
}

export const PremiumTag = ({ style }: PremiumTagProps) => {
  const { colors } = useTheme()
  return (
    <View
      style={[
        {
          paddingHorizontal: 10,
          paddingVertical: 2,
          backgroundColor: colors.primaryText,
          borderRadius: 3,
        },
        style,
      ]}
    >
      <Text text="PREMIUM" preset="bold" size="small" color={colors.background} />
    </View>
  )
}
