/* eslint-disable no-restricted-imports */
import { useAppTheme } from "@/utils/useAppTheme"
import { typography } from "app/theme"
import { forwardRef, Ref, useImperativeHandle, useRef, useState } from "react"
import { StyleProp, TextInput, TextInputProps, TextStyle, View } from "react-native"

interface Props extends Omit<TextInputProps, "ref"> {
  isError?: boolean
}

export const PinItemInput = forwardRef((props: Props, ref: Ref<TextInput>) => {
  const { isError, value, ...TextInputProps } = props
  const input = useRef<TextInput>(null)

  const { theme } = useAppTheme()
  // --------------------------- PARAMS --------------------------------
  const [isFocus, setIsFocus] = useState(false)

  const $inputWrapperStyles = {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderColor: isError
      ? theme.colors.error
      : isFocus || value
        ? theme.colors.primary
        : theme.colors.palette.neutral5,
  }

  const $inputStyles: StyleProp<TextStyle> = {
    width: 46,
    height: 52,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 37,
    paddingVertical: 0,
    color: isError ? theme.colors.error : theme.colors.primary,
    fontFamily: typography.primary.semiBold,
  }

  const onBlurInput = () => {
    setIsFocus(false)
  }

  const onFocusInput = () => {
    setIsFocus(true)
  }

  useImperativeHandle(ref, () => input.current as TextInput)

  return (
    <View style={$inputWrapperStyles}>
      <TextInput
        ref={input}
        blurOnSubmit
        caretHidden={true}
        autoCapitalize="none"
        autoCorrect={false}
        underlineColorAndroid={theme.colors.transparent}
        textAlignVertical="top"
        placeholderTextColor={theme.colors.palette.neutral5}
        {...TextInputProps}
        value={value}
        onBlur={onBlurInput}
        onFocus={onFocusInput}
        style={$inputStyles}
      />
    </View>
  )
})

PinItemInput.displayName = "PinItemInput"
