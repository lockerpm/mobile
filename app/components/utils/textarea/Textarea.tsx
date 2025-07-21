/* eslint-disable no-restricted-imports */
import { useRef, useState } from "react"
import {
  StyleProp,
  TextInputProps,
  View,
  ViewStyle,
  TextInput,
  TextStyle,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import { Text, PressableIcon } from "../../cores"
import { useClipboard } from "app/services/utils"
import { TxKeyPath, useAppLocale } from "app/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle, typography } from "@/theme"
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated"
import { bin } from "react-native-redash"

interface Props extends TextInputProps {
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<ViewStyle>
  label?: string
  labelTx?: TxKeyPath
  value: string
}

export const Textarea = (props: Props) => {
  const { style, inputStyle, editable = true, label, labelTx, value, ...rest } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()
  const { copyToClipboard } = useClipboard()

  const labelText = labelTx ? translate(labelTx) : label
  // ----------------- PARAMS -----------------

  const [isFocus, setIsFocus] = useState(false)
  const input = useRef<TextInput>(null)

  const toggleStyle = useDerivedValue(() => {
    return withTiming(bin(isFocus || !!value))
  }, [isFocus, value])

  // ----------------- RENDER -----------------

  function focusInput() {
    if (!editable) return

    input.current?.focus()
  }

  const $containerStyle: ViewStyle = {
    borderColor: isFocus ? colors.primary : colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  }

  const $titleAnim = useAnimatedStyle(() => {
    return {
      zIndex: 2,
      backgroundColor: colors.background,
      paddingHorizontal: 4,
      transform: [
        {
          scale: interpolate(toggleStyle.value, [0, 1], [1, 0.9]),
        },
        {
          translateX: interpolate(toggleStyle.value, [0, 1], [12, 0]),
        },
        {
          translateY: interpolate(toggleStyle.value, [0, 1], [39, 14]),
        },
      ],
      color: interpolateColor(toggleStyle.value, [0, 1], [colors.disable, colors.text]),
      flexBasis: 1,
    }
  })
  return (
    <View style={style}>
      <Animated.Text style={[$labelStyles, $titleAnim]}>{labelText}</Animated.Text>

      {!editable && (
        <ScrollView bounces={false} style={[$containerStyle, $view]}>
          <Text text={value} />
          <PressableIcon
            icon="copy"
            size={18}
            onPress={() => {
              copyToClipboard(value)
            }}
            containerStyle={$icon}
          />
        </ScrollView>
      )}
      {editable && (
        <TouchableOpacity activeOpacity={1} onPress={focusInput} style={$containerStyle}>
          <TextInput
            multiline
            value={value}
            autoCapitalize="none"
            selectionColor={colors.primary}
            onFocus={() => {
              setIsFocus(true)
            }}
            onBlur={() => {
              setIsFocus(false)
            }}
            placeholderTextColor={colors.label}
            style={themed([$input, inputStyle])}
            {...rest}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

const $input: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.title,
  textAlignVertical: "top",
  paddingVertical: 0,
  minHeight: 50,
})

const $icon: ViewStyle = {
  position: "absolute",
  zIndex: 100,
  top: 4,
  right: 0,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}

const $view: ViewStyle = {
  minHeight: 50,
}

const $labelStyles: StyleProp<TextStyle> = [
  {
    fontSize: 16,
    fontFamily: typography.primary.medium,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
]
