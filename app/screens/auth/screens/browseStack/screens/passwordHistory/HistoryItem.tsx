import { useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { View, TextInput, ViewStyle, TextStyle } from "react-native"
import { Text, PressableIcon } from "app/components/cores"
import { ThemedStyle, typography } from "app/theme"
import moment from "moment"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"

interface Props {
  password: string
  createAt: Date
  setSelectHistory: () => void
}

export const HistoryItem = ({ password, createAt, setSelectHistory }: Props) => {
  const { themed } = useAppTheme()
  const { translate } = useAppLocale()

  const [showText, setShowText] = useState(false)
  const updateTime = createAt.getTime()
    ? translate("password_history:updated_password") +
      moment(createAt).format("HH:mm, MMMM Do YYYY")
    : ""

  return (
    <View style={themed($container)}>
      <View style={$flex}>
        <TextInput
          editable={false}
          value={password}
          secureTextEntry={!showText}
          style={themed($input)}
        />
        {!!updateTime && <Text preset="label" text={updateTime} size="xs" />}
      </View>
      <PressableIcon
        icon={showText ? "eye-slash" : "eye"}
        size={20}
        onPress={() => {
          setShowText(!showText)
        }}
      />
      <PressableIcon
        icon="dots-three-vertical"
        size={20}
        onPress={setSelectHistory}
        containerStyle={themed($icon)}
      />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginVertical: 6,
  padding: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
})

const $icon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 6,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 4,
  marginLeft: 12,
})

const $input: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 20,
  flexGrow: 1,
  padding: 2,
})

const $flex: ViewStyle = {
  flexShrink: 1,
  flexGrow: 1,
  marginRight: 12,
}
