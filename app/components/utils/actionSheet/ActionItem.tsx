import { ActivityIndicator, ColorValue, StyleSheet, View, ViewStyle } from "react-native"
import { Text, Icon, IconTypes, PressableScale, TextProps } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"

interface ItemProps {
  /**
   * Show bottom border
   */
  bottomBorder?: boolean
  /**
   * Hide item from the action sheet
   */
  hide?: boolean
  /**
   * Item onPress callback
   */
  onPress: () => void
  /**
   * The icon to display
   */
  icon?: IconTypes
  /**
   * The text to display
   */
  text?: string
  tx?: TextProps["tx"]
  txOptions?: TextProps["txOptions"]
  /**
   * The color of text, icon to display
   */
  color?: ColorValue
  /**
   * The color of icon, icon to display
   */
  iconColor?: ColorValue
  /**
   * Add loading activity for long running task
   */
  isLoading?: boolean
}

export const NewActionSheetItem = (props: ItemProps) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { hide, icon, iconColor, text, tx, txOptions, color, onPress, isLoading } = props

  const container: ViewStyle = {
    borderBottomWidth: props.bottomBorder ? 1 : 0,
    borderBottomColor: colors.border,
    marginLeft: 16,
  }

  return !hide ? (
    <PressableScale disabled={isLoading} onPress={onPress}>
      <View style={styles.container}>
        <Text text={text} tx={tx} txOptions={txOptions} color={color} style={styles.text} />
        {!!icon && !isLoading && <Icon icon={icon} color={iconColor} />}
        {isLoading && <ActivityIndicator size="small" color={iconColor || colors.primary} />}
      </View>
      <View style={container} />
    </PressableScale>
  ) : null
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 8,
  },
})
