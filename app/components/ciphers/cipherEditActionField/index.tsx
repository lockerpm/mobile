import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { StyleSheet, TouchableOpacity, ViewProps, ViewStyle } from "react-native"
import { Icon, Text, TextProps } from "@/components/cores"

interface Props extends ViewProps {
  disabled?: boolean
  /**
   * If children are provided, they will be rendered inside the TouchableOpacity. the label will render above the TouchableOpacity.
   * if not, the label will render inside the TouchableOpacity.
   */
  children?: React.ReactNode
  label?: string
  labelTx?: TextProps["tx"]
  labelTxOptions?: TextProps["txOptions"]
  onPress?: () => void
}

export const CipherEditActionField = ({
  disabled,
  onPress,
  children,
  labelTx,
  label,
  labelTxOptions,
  style,
}: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <TouchableOpacity disabled={disabled} style={[themed($container), style]} onPress={onPress}>
      <Text
        weight="medium"
        color={!!children ? colors.title : colors.disable}
        tx={labelTx}
        text={label}
        txOptions={labelTxOptions}
        style={[
          !!children ? styles.label : styles.initLabel,
          { backgroundColor: colors.background },
        ]}
      />
      {!disabled && (
        <Icon icon="caret-right" size={20} color={colors.label} containerStyle={styles.icon} />
      )}
      {children}
    </TouchableOpacity>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  paddingHorizontal: 12,
  borderWidth: 1,
  height: 48,
  justifyContent: "center",
  borderColor: colors.border,
})

const styles = StyleSheet.create({
  icon: {
    position: "absolute",
    right: 16,
    top: 12,
  },
  initLabel: {
    left: 16,
    position: "absolute",
    top: 12,
  },
  label: {
    left: 0,
    paddingHorizontal: 4,
    position: "absolute",
    top: -15,
    transform: [{ scale: 0.9 }],
  },
})
