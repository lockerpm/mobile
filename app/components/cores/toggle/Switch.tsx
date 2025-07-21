import { useEffect, useRef, useCallback } from "react"
import { Animated, Image, ImageStyle, StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { iconRegistry } from "../icon/Icon"
import { $inputOuterBase, BaseToggleInputProps, Toggle, ToggleProps } from "./Toggle"
import { useAppTheme } from "@/utils/useAppTheme"

export interface SwitchToggleProps extends Omit<ToggleProps<SwitchInputProps>, "ToggleInput"> {
  /**
   * Switch-only prop that adds a text/icon label for on/off states.
   */
  accessibilityMode?: "text" | "icon"
  /**
   * Optional style prop that affects the knob View.
   * Note: `width` and `height` rules should be points (numbers), not percentages.
   */
  inputDetailStyle?: Omit<ViewStyle, "width" | "height"> & { width?: number; height?: number }
}

interface SwitchInputProps extends BaseToggleInputProps<SwitchToggleProps> {
  accessibilityMode?: SwitchToggleProps["accessibilityMode"]
}

/**
 * @param {SwitchToggleProps} props - The props for the `Switch` component.
 * @returns {JSX.Element} The rendered `Switch` component.
 */
export function Switch(props: SwitchToggleProps) {
  const { accessibilityMode, ...rest } = props
  const switchInput = useCallback(
    (toggleProps: SwitchInputProps) => (
      <SwitchInput {...toggleProps} accessibilityMode={accessibilityMode} />
    ),
    [accessibilityMode]
  )
  return <Toggle accessibilityRole="switch" {...rest} ToggleInput={switchInput} />
}

function SwitchInput(props: SwitchInputProps) {
  const {
    on,
    disabled,
    outerStyle: $outerStyleOverride,
    innerStyle: $innerStyleOverride,
    detailStyle: $detailStyleOverride,
  } = props

  const {
    theme: { colors },
  } = useAppTheme()

  const animate = useRef(new Animated.Value(on ? 1 : 0)) // Initial value is set based on isActive
  const opacity = useRef(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(animate.current, {
      toValue: on ? 1 : 0,
      duration: 300,
      useNativeDriver: true, // Enable native driver for smoother animations
    }).start()
  }, [on])

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: on ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [on])

  const knobSizeFallback = 2

  const knobWidth = [$detailStyleOverride?.width, $switchDetail?.width, knobSizeFallback].find(
    (v) => typeof v === "number"
  )

  const knobHeight = [$detailStyleOverride?.height, $switchDetail?.height, knobSizeFallback].find(
    (v) => typeof v === "number"
  )

  const offBackgroundColor = disabled ? colors.disable : colors.divider
  const borderColor = disabled ? colors.disable : on ? colors.success : colors.border
  const onBackgroundColor = disabled ? colors.block : colors.success

  const knobBackgroundColor = (function () {
    if (on) {
      return [
        $detailStyleOverride?.backgroundColor,
        disabled && colors.disable,
        colors.background,
      ].filter(Boolean)[0]
    } else {
      return [
        $innerStyleOverride?.backgroundColor,
        disabled && colors.disable,
        colors.disable,
      ].filter(Boolean)[0]
    }
  })()

  const rtlAdjustment = 1
  const $themedSwitchInner: StyleProp<ViewStyle> = [$toggleInner, $switchInner]

  const offsetLeft = 4
  const offsetRight = 4

  const outputRange = [
    rtlAdjustment * offsetLeft,
    rtlAdjustment * (+(knobWidth || 0) + offsetRight),
  ]

  const $animatedSwitchKnob = animate.current.interpolate({
    inputRange: [0, 1],
    outputRange,
  })

  return (
    <View
      style={[
        $inputOuter,
        { backgroundColor: offBackgroundColor, borderColor: borderColor },
        $outerStyleOverride,
      ]}
    >
      <Animated.View
        style={[
          $themedSwitchInner,
          { backgroundColor: onBackgroundColor },
          $innerStyleOverride,
          { opacity: opacity.current },
        ]}
      />

      <SwitchAccessibilityLabel {...props} role="on" />
      <SwitchAccessibilityLabel {...props} role="off" />

      <Animated.View
        style={[
          $switchDetail,
          $detailStyleOverride,
          { transform: [{ translateX: $animatedSwitchKnob }] },
          { width: knobWidth, height: knobHeight },
          { backgroundColor: knobBackgroundColor as string },
        ]}
      />
    </View>
  )
}

/**
 * @param {ToggleInputProps & { role: "on" | "off" }} props - The props for the `SwitchAccessibilityLabel` component.
 * @returns {JSX.Element} The rendered `SwitchAccessibilityLabel` component.
 */
function SwitchAccessibilityLabel(props: SwitchInputProps & { role: "on" | "off" }) {
  const { on, disabled, accessibilityMode, role, innerStyle, detailStyle } = props

  const {
    theme: { colors },
  } = useAppTheme()

  if (!accessibilityMode) return null

  const shouldLabelBeVisible = (on && role === "on") || (!on && role === "off")

  const $switchAccessibilityStyle: StyleProp<ViewStyle> = [
    $switchAccessibility,
    role === "off" && { end: "5%" },
    role === "on" && { left: "5%" },
  ]

  const color = (function () {
    if (disabled) return colors.disable
    if (!on) return innerStyle?.backgroundColor || colors.block
    return detailStyle?.backgroundColor || colors.border
  })()

  return (
    <View style={$switchAccessibilityStyle}>
      {accessibilityMode === "text" && shouldLabelBeVisible && (
        <View
          style={[
            role === "on" && $switchAccessibilityLine,
            role === "on" && { backgroundColor: color },
            role === "off" && $switchAccessibilityCircle,
            role === "off" && { borderColor: color },
          ]}
        />
      )}

      {accessibilityMode === "icon" && shouldLabelBeVisible && (
        <Image
          style={[$switchAccessibilityIcon, { tintColor: color }]}
          source={role === "off" ? iconRegistry["eye-slash"] : iconRegistry.eye}
        />
      )}
    </View>
  )
}

const $toggleInner: ViewStyle = {
  width: "100%",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}

const $inputOuter: StyleProp<ViewStyle> = [
  $inputOuterBase,
  { height: 32, width: 56, borderRadius: 16, borderWidth: 1 },
]

const $switchInner: ViewStyle = {
  position: "absolute",
  paddingStart: 4,
  paddingEnd: 4,
}

const $switchDetail: SwitchToggleProps["inputDetailStyle"] = {
  borderRadius: 12,
  position: "absolute",
  width: 24,
  height: 24,
}

const $switchAccessibility: TextStyle = {
  width: "40%",
  justifyContent: "center",
  alignItems: "center",
}

const $switchAccessibilityIcon: ImageStyle = {
  width: 14,
  height: 14,
  resizeMode: "contain",
}

const $switchAccessibilityLine: ViewStyle = {
  width: 2,
  height: 12,
}

const $switchAccessibilityCircle: ViewStyle = {
  borderWidth: 2,
  width: 12,
  height: 12,
  borderRadius: 6,
}
