import { ActivityIndicator, StyleSheet, ViewStyle } from "react-native"

import { Icon, PressableScale, Text } from "app/components/cores"
import { TxKeyPath } from "app/i18n"

import { useAppTheme } from "@/utils/useAppTheme"

type SettingsItemProps = {
  text?: string
  textTx?: TxKeyPath
  RightAccessory?: React.ReactNode
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
  const {
    theme: { colors },
  } = useAppTheme()

  const renderRightComponent = () => {
    if (isLoading) return <ActivityIndicator size="small" color={colors.primary} />
    if (RightAccessory) return RightAccessory

    return <Icon icon="caret-right" size={20} color={colors.label} />
  }

  return (
    <PressableScale
      disabled={!onPress || disabled}
      onPress={onPress}
      style={[styles.container, containerStyle]}
    >
      <Text text={text} tx={textTx} color={color} style={styles.text} />
      {renderRightComponent()}
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 8,
  },
})
