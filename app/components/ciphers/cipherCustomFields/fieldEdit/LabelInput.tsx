/* eslint-disable no-restricted-imports */
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "app/theme"
import { TextInput, TextStyle } from "react-native"

type Props = {
  value: string
  onChange: (val: string) => void
  onFocus: () => void
  onBlur: () => void
}

export const LabelInput = (props: Props) => {
  const { value, onChange, onFocus, onBlur } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholderTextColor={colors.label}
      selectionColor={colors.primary}
      style={themed($input)}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

const $input: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.title,
  fontSize: 16,
  paddingVertical: 10,
  flex: 1,
})
