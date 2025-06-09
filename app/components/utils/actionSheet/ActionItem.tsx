import React from "react"
import { ColorValue, StyleSheet, View } from "react-native"
import { Text, Icon, IconTypes, PressableScale } from "app/components/cores"
import { TOptions, TxKeyPath } from "app/i18n"
import { useTheme } from "app/services/context"

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
  tx?: TxKeyPath
  txOptions?: TOptions
  /**
   * The color of text, icon to display
   */
  color?: ColorValue
  /**
   * The color of icon, icon to display
   */
  iconColor?: ColorValue
}

export const NewActionSheetItem = (props: ItemProps) => {
  const { colors } = useTheme()
  const { hide, icon, iconColor, text, tx, txOptions, color, onPress } = props

  return !hide ? (
    <PressableScale onPress={onPress}>
      <View
        style={[
          styles.container,
          { borderBottomWidth: props.bottomBorder ? 1 : 0, borderBottomColor: colors.border },
        ]}
      >
        <Text text={text} tx={tx} txOptions={txOptions} color={color} style={styles.text} />
        {!!icon && <Icon icon={icon} color={iconColor} />}
      </View>
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
