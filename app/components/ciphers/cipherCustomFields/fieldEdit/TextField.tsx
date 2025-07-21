import { useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { StyleSheet, TextInput, TextStyle, View } from "react-native"
import { PressableIcon } from "../../../cores"
import { FieldType } from "core/enums"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

type Props = {
  type: FieldType
  value: string
  placeholder: string
  onChange: (val: string) => void
  onFocus: () => void
  onBlur: () => void
}

export const TextField = (props: Props) => {
  const { value, onChange, placeholder, type, onBlur, onFocus } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [isVisible, setIsVisible] = useState(false)

  const keyboardType = (() => {
    switch (type) {
      case FieldType.Phone:
        return "phone-pad"
      case FieldType.URL:
        return "url"
      default:
        return "default"
    }
  })()

  return (
    <View style={styles.container}>
      <TextInput
        secureTextEntry={type === FieldType.Hidden && !isVisible}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.label}
        selectionColor={colors.primary}
        keyboardType={keyboardType}
        style={themed($input)}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      {type === FieldType.Hidden && (
        <PressableIcon
          icon={isVisible ? "eye-slash" : "eye"}
          size={18}
          onPress={() => {
            setIsVisible(!isVisible)
          }}
          containerStyle={styles.eye}
        />
      )}
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
  eye: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    width: 30,
  },
})
