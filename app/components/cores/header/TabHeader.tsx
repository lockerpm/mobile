import { View, ViewStyle } from "react-native"
import { Text, TextProps } from "../text/Text"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  title?: TextProps["text"]
  titleTx?: TextProps["tx"]
  titleOptions?: TextProps["txOptions"]
}

export const TabHeader = ({ title, titleTx, titleOptions }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const $containerInsets = useSafeAreaInsetsStyle(["top"])
  return (
    <View style={[$containerInsets, { backgroundColor: colors.background }]}>
      <View style={$container}>
        <Text preset="heading" text={title} tx={titleTx} txOptions={titleOptions} />
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  paddingHorizontal: 24,
  height: 56,
  justifyContent: "center",
}
