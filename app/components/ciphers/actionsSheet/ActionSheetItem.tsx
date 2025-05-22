import { Icon, IconTypes, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import * as React from "react"
import { ColorValue, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"

export interface ActionItemProps {
  /**
   * Show bottom divider
   */
  bottomDivider?: boolean
  /**
   * Item name
   */
  name: string
  /**
   * Item custom icon
   */
  icon?: IconTypes
  /**
   * Overide defaule icon color
   */
  iconColor?: ColorValue
  /**
   * Overide defaule text and icon color
   */
  color?: ColorValue
  /**
   * Call back when user press this action
   */
  action: () => void
  /**
   * Disable touch
   */
  disabled?: boolean
  /**
   * Custom style for the container
   */
  containerStyle?: StyleProp<ViewStyle>
}

export const ActionItem = (props: ActionItemProps) => {
  const { name, icon, action, disabled, color, containerStyle, iconColor, bottomDivider } = props
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        styles.container,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: bottomDivider ? 1 : 0,
        },
        containerStyle,
      ]}
      onPress={action}
    >
      <View style={styles.content}>
        <Text text={name} color={color} />
        {!!icon && <Icon icon={icon} size={22} color={iconColor || color} />}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
})
