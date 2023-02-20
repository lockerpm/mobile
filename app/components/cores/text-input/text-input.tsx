import React, {
  ComponentType,
  forwardRef,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import {
  NativeSyntheticEvent,
  StyleProp,
  TextInput as RNTextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated"
import { bin } from "react-native-redash"
import { useMixins } from "../../../services/mixins"
import { Icon } from "../icon/icon"
import { Text, TextProps } from "../text/text"

export interface TextFieldAccessoryProps {
  style: StyleProp<any>
  status: TextFieldProps["status"]
  multiline: boolean
  editable: boolean
}

export interface TextFieldProps extends Omit<TextInputProps, "ref"> {
  /**
   *  error style modifier for different input states.
   */
  isError?: boolean
  /**
   *  disbled style modifier for different input states.
   */
  isDisabled?: boolean

  /**
   * Animated title
   */
  animated?: boolean
  /**
   * Input password
   */
  isPassword?: boolean
  /**
   * A style modifier for different input states.
   */
  status?: "error" | "disabled"
  /**
   * The label text to display if not using .
   */
  label?: TextProps["text"]
  /**
   * Pass any additional props directly to the label Text component.
   */
  LabelTextProps?: TextProps
  /**
   * The helper text to display if not using .
   */
  helper?: TextProps["text"]
  /**
   * Pass any additional props directly to the helper Text component.
   */
  HelperTextProps?: TextProps
  /**
   * The placeholder text to display if not using .
   */
  placeholder?: TextProps["text"]
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
   * An optional component to render on the right side of the input.
   * Example: `RightAccessory={(props) => <Icon icon="ladybug" containerStyle={props.style} color={props.editable ? colors.textDim : colors.text} />}`
   * Note: It is a good idea to memoize this.
   */
  RightAccessory?: ComponentType<TextFieldAccessoryProps>
  /**
   * An optional component to render on the left side of the input.
   * Example: `LeftAccessory={(props) => <Icon icon="ladybug" containerStyle={props.style} color={props.editable ? colors.textDim : colors.text} />}`
   * Note: It is a good idea to memoize this.
   */
  LeftAccessory?: ComponentType<TextFieldAccessoryProps>
}

/**
 * A component that allows for the entering and editing of text.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-TextField.md)
 */
export const TextInput = forwardRef(function TextField(
  props: TextFieldProps,
  ref: Ref<RNTextInput>,
) {
  const {
    isError,
    isDisabled,
    isPassword,
    animated,
    label,
    placeholder,
    helper,
    status: statusProps,
    RightAccessory,
    LeftAccessory,
    HelperTextProps,
    LabelTextProps,
    style: $inputStyleOverride,
    containerStyle: $containerStyleOverride,
    inputWrapperStyle: $inputWrapperStyleOverride,
    onFocus: propsFocus,
    onBlur: propsBlur,
    value = "",
    ...TextInputProps
  } = props

  const { color: colors } = useMixins()
  const [isFocus, setIsFocus] = useState(false)
  const [isShowText, setIsShowText] = useState(false)
  const input = useRef<RNTextInput>()
  const status = (() => {
    const _status = (isError && "error") || (isDisabled && "disabled")
    if (_status) return _status
    return undefined
  })()
  const disabled = TextInputProps.editable === false || status === "disabled"

  const placeholderContent = placeholder

  const $containerStyles = [$containerStyleOverride]
  const $labelStyles = [$labelStyle, LabelTextProps?.style]

  const $inputWrapperStyles = [
    $inputWrapperStyle,
    { borderColor: isFocus && !disabled ? colors.primary : colors.disabled },
    status === "error" && { borderColor: colors.error },
    TextInputProps.multiline && { minHeight: 112 },
    LeftAccessory && { paddingStart: 0 },
    RightAccessory && { paddingEnd: 0 },
    $inputWrapperStyleOverride,
  ]

  const $inputStyles = [
    $inputStyle,
    disabled && { color: colors.disabled },
    TextInputProps.multiline && { height: "auto" },
    $inputStyleOverride,
  ]

  const $helperStyles = [
    $helperStyle,
    status === "error" && { color: colors.error },
    HelperTextProps?.style,
  ]

  function focusInput() {
    if (disabled) return

    input.current?.focus()
  }

  useImperativeHandle(ref, () => input.current)

  const onFucus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocus(true)
    propsFocus && propsFocus(e)
  }

  const onBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocus(false)
    propsBlur && propsBlur(e)
  }


  const toggleStyle = useDerivedValue(() => {
    return withTiming(bin(isFocus || value.length !== 0))
  })

  const titleAnim = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(toggleStyle.value, [0, 1], [1, 0.9]),
        },
        {
          translateX: interpolate(toggleStyle.value, [0, 1], [12, -12]),
        },
        {
          translateY: interpolate(toggleStyle.value, [0, 1], [42, 0]),
        }
      ],
      color: interpolateColor(toggleStyle.value, [0, 1], [colors.disabled, colors.text]),
    }

  })

  const $titleColor = useAnimatedStyle(() => {
    return {
      color: interpolateColor(toggleStyle.value, [0, 1], [colors.disabled, colors.textBlack]),
    }
  })
  return (
    <TouchableOpacity
      activeOpacity={1}
      style={$containerStyles}
      onPress={focusInput}
      accessibilityState={{ disabled }}
    >
      {!!label && (
          <Text
            preset="label"
            text={label}
            {...LabelTextProps}
            style={[$labelStyles, $titleColor, titleAnim]}
          />
      )}

      <View style={$inputWrapperStyles}>
        {!!LeftAccessory && (
          <LeftAccessory
            style={$leftAccessoryStyle}
            status={status}
            editable={!disabled}
            multiline={TextInputProps.multiline}
          />
        )}

        <RNTextInput
          ref={input}
          underlineColorAndroid={colors.transparent}
          textAlignVertical="top"
          placeholder={placeholderContent}
          placeholderTextColor={colors.disabled}
          {...TextInputProps}
          secureTextEntry={!isShowText && isPassword}
          selectionColor={colors.primary}
          onFocus={onFucus}
          onBlur={onBlur}
          editable={!disabled}
          style={$inputStyles}
        />

        {isPassword && (
          <Icon
            onPress={() => {
              setIsShowText(!isShowText)
            }}
            containerStyle={$rightAccessoryStyle}
            icon={isShowText ? "eye" : "eye-slash"}
            color={colors.textBlack}
            size={20}
          />
        )}

        {!!RightAccessory && !isPassword && (
          <RightAccessory
            style={$rightAccessoryStyle}
            status={status}
            editable={!disabled}
            multiline={TextInputProps.multiline}
          />
        )}
      </View>

      {!!helper && <Text preset="label" text={helper} {...HelperTextProps} style={$helperStyles} />}
    </TouchableOpacity>
  )
})

const $labelStyle: TextStyle = {
  marginBottom: 8,
}

const $inputWrapperStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  borderWidth: 1,
  borderRadius: 12,
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

const $helperStyle: TextStyle = {
  marginTop: 12,
}

const $rightAccessoryStyle: ViewStyle = {
  paddingEnd: 12,
  height: 48,
  paddingLeft: 4,
  justifyContent: "center",
  alignItems: "center",
}
const $leftAccessoryStyle: ViewStyle = {
  paddingEnd: 12,
  height: 48,
  paddingLeft: 4,
  justifyContent: "center",
  alignItems: "center",
}
