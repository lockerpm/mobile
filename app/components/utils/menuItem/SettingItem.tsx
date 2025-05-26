import React from "react"
import { ActivityIndicator, TouchableOpacity, ViewStyle } from "react-native"
import { Icon, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { TxKeyPath } from "app/i18n"

type SettingsItemProps = {
  text?: string
  textTx?: TxKeyPath
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
  text,
  textTx,
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

    return <Icon icon="caret-right" size={20} color={colors.secondaryText} />
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
        text={text}
        tx={textTx}
        color={color}
        style={{
          flex: 1,
        }}
      />
      {renderRightComponent()}
    </TouchableOpacity>
  )
}
