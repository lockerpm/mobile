import { useNavigation } from "@react-navigation/native"
import { Icon, IconTypes, Text } from "app/components/cores"
import { PremiumTag } from "app/components/utils"
import { useStores } from "app/models"
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
   * onClose callback
   */
  onClose: () => void
  /**
   * Disable touch
   */
  disabled?: boolean
  containerStyle?: StyleProp<ViewStyle>
}

export const ActionPremiumItem = (props: ActionItemProps) => {
  const navigation: any = useNavigation()
  const { name, icon, action, onClose, disabled, color, containerStyle, iconColor } = props

  const { user } = useStores()
  const onPress = () => {
    if (user.isFreePlan) {
      navigation.navigate("payment")
      onClose()
      return
    }
    action()
  }

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
      onPress={onPress}
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
          {user.isFreePlan && <PremiumTag />}
        </View>
        {!!icon && <Icon icon={icon} size={22} color={iconColor || color} />}
      </View>
    </TouchableOpacity>
  )
}
