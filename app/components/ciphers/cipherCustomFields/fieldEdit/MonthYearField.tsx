// eslint-disable-next-line no-restricted-imports
import { StyleSheet, TextInput, TextStyle, View } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { MaskService } from "react-native-masked-text"

type Props = {
  value: string
  onChange: (val: string) => void
  onFocus: () => void
  onBlur: () => void
}

export const MonthYearField = (props: Props) => {
  const { value, onChange, onBlur, onFocus } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const validateMask = (text: string) => {
    if (text) {
      let masked = MaskService.toMask("datetime", text, {
        format: "MM/YY",
      })
      if (masked.length === 2) {
        const month = parseInt(masked)
        if (month === 0) {
          masked = "01"
        } else if (month > 12) {
          masked = "12"
        }
      }
      return onChange(masked)
    }
    return onChange("")
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={validateMask}
        placeholder={"MM/YY"}
        placeholderTextColor={colors.label}
        selectionColor={colors.primary}
        keyboardType={"number-pad"}
        style={themed($input)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  )
}

const $input: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.title,
  fontSize: 16,
  paddingVertical: 10,
  flex: 1,
})

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
  },
})
