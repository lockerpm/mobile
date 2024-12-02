import { useTheme } from "app/services/context"
import { typography } from "app/theme"
import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from "react"
import { StyleProp, TextInput, TextInputProps, TextStyle, View } from "react-native"

interface Props extends Omit<TextInputProps, "ref"> {
  isError?: boolean
}

export const PinItemInput = forwardRef((props: Props, ref: Ref<TextInput>) => {
  const { isError, value, ...TextInputProps } = props
  const input = useRef<TextInput>(null)

  const { colors } = useTheme()
  // --------------------------- PARAMS --------------------------------
  const [isFocus, setIsFocus] = useState(false)

  const $inputWrapperStyles = {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderColor: isError
      ? colors.error
      : isFocus || value
      ? colors.primary
      : colors.palette.neutral5,
  }

  const $inputStyles: StyleProp<TextStyle> = {
    width: 46,
    height: 52,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 37,
    color: isError ? colors.error : colors.primary,
    fontFamily: typography.primary.semibold,
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
        underlineColorAndroid={colors.transparent}
        textAlignVertical="top"
        placeholderTextColor={colors.palette.neutral5}
        {...TextInputProps}
        value={value}
        onBlur={onBlurInput}
        onFocus={onFocusInput}
        style={$inputStyles}
      />
    </View>
  )
})
