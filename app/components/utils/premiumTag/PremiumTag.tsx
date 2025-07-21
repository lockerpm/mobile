import { StyleProp, View, ViewStyle } from "react-native"
import { Text } from "../../cores"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type PremiumTagProps = {
  style?: StyleProp<ViewStyle>
}

export const PremiumTag = ({ style }: PremiumTagProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  return (
    <View style={themed([$container, style])}>
      <Text text="PREMIUM" preset="bold" size="xs" color={colors.background} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 10,
  paddingVertical: 2,
  backgroundColor: colors.text,
  borderRadius: 3,
})
