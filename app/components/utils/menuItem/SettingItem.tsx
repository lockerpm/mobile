import React from "react"
import { ActivityIndicator, TouchableOpacity, ViewStyle } from "react-native"
import { Icon, Text } from "app/components/cores"
import { useTheme } from "app/services/context"

type SettingsItemProps = {
  name: string
  RightAccessory?: JSX.Element
  color?: string
  onPress?: () => void
  disabled?: boolean
  isLoading?: boolean
  /**
   * Helpful when adding margin or border
   */
  containerStyle?: ViewStyle
}

export const SettingsItem = ({
  name,
  RightAccessory,
  color,
  onPress,
  disabled,
  isLoading,
  containerStyle,
}: SettingsItemProps) => {
  const { colors } = useTheme()

  const renderRightComponent = () => {
    if (isLoading) return <ActivityIndicator size="small" color={colors.primary} />
    if (RightAccessory) return RightAccessory

    return <Icon icon="caret-right" size={20} />
  }

  return (
    <TouchableOpacity
      disabled={!onPress || disabled}
      onPress={onPress}
      style={[
        {
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
        },
        containerStyle,
      ]}
    >
      <Text
        text={name}
        color={color}
        style={{
          flex: 1,
        }}
      />
      {renderRightComponent()}
    </TouchableOpacity>
  )
}
