import { View, StyleSheet, ViewStyle, StyleProp } from "react-native"
import { Text, TextProps } from "../text/Text"
import { PressableIcon } from "../icon/Icon"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  text?: string
  tx?: TextProps["tx"]
  onClose?: () => void
  style?: StyleProp<ViewStyle>
}

export const BottomModalHeader = ({ tx, text, onClose, style }: Props) => {
  const { themed } = useAppTheme()
  return !!tx || !!text ? (
    <View style={[styles.header, style]}>
      <Text preset="bold" numberOfLines={2} text={text} tx={tx} size="lg" style={styles.title} />
      <PressableIcon icon="x" onPress={onClose} />
    </View>
  ) : (
    <View style={$scrollIndexContainer}>
      <View style={themed($scrollIndex)} />
    </View>
  )
}

const $scrollIndexContainer: ViewStyle = {
  paddingVertical: 4,
  justifyContent: "center",
  alignItems: "center",
}

const $scrollIndex: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginVertical: 5,
  height: 4,
  borderRadius: 2,
  width: 50,
  backgroundColor: colors.text,
})

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 45,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  title: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
