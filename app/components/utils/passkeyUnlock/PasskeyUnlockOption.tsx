import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"

import { Icon, Text } from "app/components/cores"

import { TxKeyPath } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  // e.g. "or unlock with"
  labelTx: TxKeyPath
  disabled?: boolean
  onPress: () => void
}

export const PasskeyUnlockOption = ({ labelTx, disabled, onPress }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View>
      <Text preset="label" size="xs" tx={labelTx} style={styles.label} />
      <TouchableOpacity disabled={disabled} onPress={onPress} style={themed($button)}>
        <Icon icon="person-key" size={20} color={colors.primary} />
        <Text color={colors.primary} tx="lock:your_passkey" style={styles.text} />
      </TouchableOpacity>
    </View>
  )
}

const $button: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 44,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.primary,
  backgroundColor: colors.background,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
})

const styles = StyleSheet.create({
  label: {
    marginBottom: 12,
    marginTop: 16,
    textAlign: "center",
  },
  text: {
    marginLeft: 8,
  },
})
