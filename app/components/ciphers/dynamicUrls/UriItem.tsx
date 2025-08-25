/* eslint-disable no-restricted-imports */
import { forwardRef, Ref, useImperativeHandle, useRef } from "react"
import {
  StyleProp,
  TextInput as RNTextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Linking,
} from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"
import { PressableIcon } from "@/components/cores"

export interface TextFieldProps extends Omit<TextInputProps, "ref"> {
  isDeletable: boolean
  /**
   * The placeholder text to display if not using .
   */
  placeholder?: string
  /**
   * Optional input style override.
   */
  style?: StyleProp<TextStyle>
  /**
   * Style overrides for the container
   */
  containerStyle?: StyleProp<ViewStyle>
  /**
   * Style overrides for the input wrapper
   */
  inputWrapperStyle?: StyleProp<ViewStyle>
  /**
   * remove
   */
  onRemove: () => void
}

/**
 * A component that allows for the entering and editing of text.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-TextField.md)
 */
export const UriItem = forwardRef(function TextField(
  props: TextFieldProps,
  ref: Ref<RNTextInput | null>
) {
  const {
    isDeletable,
    placeholder,
    style: $inputStyleOverride,
    containerStyle: $containerStyleOverride,
    inputWrapperStyle: $inputWrapperStyleOverride,
    onRemove,
    ...TextInputProps
  } = props
  const {
    theme: { colors },
  } = useAppTheme()

  // -------------------- PARAMS --------------------
  const input = useRef<RNTextInput>(null)
  const onOpenLink = () => {
    if (TextInputProps.value) {
      Linking.openURL(TextInputProps.value).catch(() => {
        Linking.openURL("https://" + TextInputProps.value)
      })
    }
  }
  // -------------------- COMPUTED --------------------

  const disabled = TextInputProps.editable === false

  const $containerStyles: StyleProp<ViewStyle> = [
    { width: "100%", alignItems: "flex-start", marginVertical: 2 },
    $containerStyleOverride,
  ]

  const $inputWrapperStyles = [
    $inputWrapperStyle,
    TextInputProps.multiline && { minHeight: 112 },
    $inputWrapperStyleOverride,
  ]

  const $inputStyles: StyleProp<TextStyle> = [
    $inputStyle,
    { color: colors.text },
    TextInputProps.multiline && { height: "auto" },
    $inputStyleOverride,
  ]

  function focusInput() {
    if (disabled) return

    input.current?.focus()
  }

  useImperativeHandle(ref, () => input.current)

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={$containerStyles}
      onPress={focusInput}
      accessibilityState={{ disabled }}
    >
      <View style={$inputWrapperStyles}>
        <RNTextInput
          ref={input}
          autoCapitalize="none"
          underlineColorAndroid={colors.transparent}
          textAlignVertical="top"
          placeholder={placeholder}
          placeholderTextColor={colors.disable}
          selectionColor={colors.primary}
          editable={!disabled}
          {...TextInputProps}
          style={$inputStyles}
        />
        {!disabled && isDeletable && (
          <PressableIcon
            icon="minus-circle"
            color={colors.error}
            size={18}
            containerStyle={$rightAccessoryStyle}
            onPress={onRemove}
          />
        )}
        {disabled && (
          <PressableIcon
            icon="external-link"
            size={20}
            onPress={onOpenLink}
            containerStyle={$rightAccessoryStyle}
          />
        )}
      </View>
    </TouchableOpacity>
  )
})

const $rightAccessoryStyle: ViewStyle = {
  paddingEnd: 12,
  height: 48,
  paddingLeft: 4,
  justifyContent: "center",
  alignItems: "center",
}

const $inputWrapperStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  overflow: "hidden",
}

const $inputStyle: TextStyle = {
  flex: 1,
  alignSelf: "stretch",
  fontSize: 16,
  height: 24,
  paddingVertical: 0,
  paddingHorizontal: 0,
  margin: 12,
}
