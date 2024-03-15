import { Icon, IconTypes, Text } from "app/components/cores"
import * as React from "react"
import { ColorValue, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"

export interface ActionItemProps {
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
  containerStyle?: StyleProp<ViewStyle>
}

export const ActionItem = (props: ActionItemProps) => {
  const { name, icon, action, disabled, color, containerStyle, iconColor } = props

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        {
          paddingVertical: 12,
          paddingHorizontal: 20,
        },
        containerStyle,
      ]}
      onPress={action}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text text={name} color={color} style={{ marginRight: 8 }} />
        </View>
        {!!icon && <Icon icon={icon} size={22} color={iconColor || color} />}
      </View>
    </TouchableOpacity>
  )
}
