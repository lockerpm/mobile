/* eslint-disable no-restricted-imports */
import {
  ComponentType,
  forwardRef,
  Ref,
  useEffect,
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
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated"
import { bin } from "react-native-redash"
import { PressableIcon } from "../icon/Icon"
import { Text, TextProps } from "../text/Text"
import { typography } from "app/theme"
import {
  MaskService,
  TextInputMaskTypeProp,
  TextInputMaskOptionProp,
} from "react-native-masked-text"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { useClipboard } from "@/services/utils"

export interface TextFieldAccessoryProps {
  style: StyleProp<any>
  status: TextFieldProps["status"]
  editable: boolean
}

export interface TextFieldProps extends Omit<TextInputProps, "ref"> {
  /**
   *  error style modifier for different input states.
   */
  isError?: boolean
  /**
   *  This field cannot be left blank
   */
  isRequired?: boolean
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
   * Copy button
   */
  isCopyable?: boolean
  /**
   * A style modifier for different input states.
   */
  status?: "error" | "disabled"
  /**
   * Title
   */
  label?: TextProps["text"]
  /**
   * Title tx
   */
  labelTx?: TextProps["tx"]
  /**
   * Title txoptions
   */
  labelTxOption?: TextProps["txOptions"]
  /**
   * Pass any additional props directly to the label Text component.
   */
  LabelTextProps?: TextProps
  /**
   * The helper text to display if not using .
   */
  helper?: TextProps["text"]
  helperTx?: TextProps["tx"]
  /**
   * Pass any additional props directly to the helper Text component.
   */
  HelperTextProps?: TextProps
  /**
   * The placeholder text to display if not using .
   */
  placeholder?: TextProps["text"]
  /**
   * The placeholder tx to display if not using .
   */
  placeholderTx?: TextProps["tx"]
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
  /**
   * Custom value
   */
  maskType?: TextInputMaskTypeProp
  maskOptions?: TextInputMaskOptionProp
}

/**
 * A component that allows for the entering and editing of text.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-TextField.md)
 */
export const TextInput = forwardRef(function TextField(
  props: TextFieldProps,
  ref: Ref<RNTextInput | null>
) {
  const {
    isRequired: isRequiredProps,
    isError,
    isDisabled,
    isPassword,
    isCopyable,
    animated,
    placeholder,
    placeholderTx,
    helper: helperProps,
    status: statusProps,
    maskType,
    maskOptions,
    label,
    labelTx,
    labelTxOption,
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
  const { translate } = useAppLocale()
  const { copyToClipboard } = useClipboard()
  const {
    theme: { colors },
  } = useAppTheme()

  // -------------------- PARAMS --------------------
  const [isFocus, setIsFocus] = useState(false)
  const [isRequired, setIsRequired] = useState(false)
  const [isShowText, setIsShowText] = useState(false)
  const input = useRef<RNTextInput>(null)

  // -------------------- COMPUTED --------------------
  const status = (() => {
    if (isRequired || isError) {
      return "error"
    }
    if (isDisabled) {
      return "disabled"
    }
    return statusProps
  })()
  const disabled = TextInputProps.editable === false || status === "disabled"

  const helper = value ? helperProps : isRequired && translate("common:required_text")
  const placeholderText = placeholder || (placeholderTx && translate(placeholderTx))
  const placeholderContent = placeholderText && placeholderText + (isRequiredProps ? " (*)" : "")

  const labelProps = label || (labelTx && translate(labelTx, labelTxOption))

  const $containerStyles: StyleProp<ViewStyle> = [
    { width: "100%", alignItems: "flex-start", marginVertical: 2 },
    $containerStyleOverride,
  ]
  const $labelStyles: StyleProp<TextStyle> = [
    {
      fontSize: 16,
      fontFamily: typography.primary.medium,
      marginBottom: 4,
    },
    LabelTextProps?.style,
  ]

  const $inputWrapperStyles = [
    $inputWrapperStyle,
    {
      borderColor: isFocus && !disabled ? colors.primary : colors.border,
    },
    status === "error" && { borderColor: colors.error },
    TextInputProps.multiline && { minHeight: 112 },
    LeftAccessory && { paddingStart: 0 },
    RightAccessory && { paddingEnd: 0 },
    $inputWrapperStyleOverride,
  ]

  const $inputStyles: StyleProp<TextStyle> = [
    $inputStyle,
    { color: colors.text },
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

  const validateMask = (text: string) => {
    if (text && (maskType || maskOptions)) {
      const masked = MaskService.toMask(maskType || "custom", text, maskOptions)
      return masked
    }
    return text
  }

  useImperativeHandle(ref, () => input.current)

  const onFucus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocus(true)
    if (propsFocus) {
      propsFocus(e)
    }
  }

  const onBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocus(false)
    if (isRequiredProps && !value) {
      setIsRequired(true)
    }
    if (propsBlur) {
      propsBlur(e)
    }
  }

  const toggleStyle = useDerivedValue(() => {
    return withTiming(bin(isFocus || !!value || disabled))
  }, [isFocus, value])

  useEffect(() => {
    if (isRequiredProps && !!value) {
      setIsRequired(false)
    }
  }, [value])

  const $titleAnim = useAnimatedStyle(() => {
    return {
      zIndex: 2,
      backgroundColor: colors.background,
      paddingHorizontal: 4,
      transform: animated
        ? [
            {
              scale: interpolate(toggleStyle.value, [0, 1], [1, 0.9]),
            },
            {
              translateX: interpolate(toggleStyle.value, [0, 1], [12, 0]),
            },
            {
              translateY: interpolate(toggleStyle.value, [0, 1], [39, 14]),
            },
          ]
        : [],
      color: animated
        ? interpolateColor(toggleStyle.value, [0, 1], [colors.disable, colors.text])
        : colors.text,
    }
  })

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={$containerStyles}
      onPress={focusInput}
      accessibilityState={{ disabled }}
    >
      {!!labelProps && (
        <Animated.Text style={[$labelStyles, $titleAnim]} {...LabelTextProps}>
          {labelProps + (isRequiredProps ? " (*)" : "")}
        </Animated.Text>
      )}

      <View style={$inputWrapperStyles}>
        {!!LeftAccessory && (
          <LeftAccessory style={$leftAccessoryStyle} status={status} editable={!disabled} />
        )}

        <RNTextInput
          ref={input}
          autoCapitalize="none"
          underlineColorAndroid={colors.transparent}
          textAlignVertical="top"
          placeholder={animated && !isFocus ? "" : placeholderContent}
          placeholderTextColor={colors.disable}
          value={validateMask(value)}
          secureTextEntry={!isShowText && isPassword}
          selectionColor={colors.primary}
          onFocus={onFucus}
          onBlur={onBlur}
          editable={!disabled}
          {...TextInputProps}
          style={$inputStyles}
        />

        {isPassword && !!value && (
          <PressableIcon
            onPress={() => {
              setIsShowText(!isShowText)
            }}
            containerStyle={$rightAccessoryStyle}
            icon={!isShowText ? "eye" : "eye-slash"}
            size={20}
          />
        )}

        {isCopyable && !!value && (
          <PressableIcon
            onPress={() => {
              copyToClipboard(value)
            }}
            containerStyle={$rightAccessoryStyle}
            icon={"copy"}
            size={20}
          />
        )}

        {!!RightAccessory && !isCopyable && (
          <RightAccessory style={$rightAccessoryStyle} status={status} editable={!disabled} />
        )}
      </View>

      {(helper || props.helperTx) && status === "error" && (
        <Text
          preset="label"
          tx={props.helperTx}
          text={helper || undefined}
          {...HelperTextProps}
          style={$helperStyles}
        />
      )}
    </TouchableOpacity>
  )
})

const $inputWrapperStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  borderWidth: 1,
  borderRadius: 8,
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
  marginTop: 8,
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
