import React from "react"
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  StyleSheet,
  View,
  ViewStyle,
  ActivityIndicator,
  ColorValue,
} from "react-native"
import { Text, TextProps } from "../text/Text"
import { useTheme } from "app/services/context"

type Presets = "primary" | "secondary" | "teriatary"
type Sizes = keyof typeof $sizeStyles

export interface ButtonAccessoryProps {
  style: StyleProp<any>
  pressableState: PressableStateCallbackType
}

export interface ButtonProps extends PressableProps {
  /**
   * Button is disabled
   */
  disabled?: boolean
  /**
   * The Button is performing a long action
   */
  loading?: boolean
  /**
   * Buttom size modifier.
   */
  size?: Sizes

  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: TextProps["text"]
  /**
   * The text to display if not using `tx` or nested components.
   */
  tx?: TextProps["tx"]
  /**
   * The text to display if not using `tx` or nested components.
   */
  txOptions?: TextProps["txOptions"]
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * An optional style override for the "pressed" state.
   */
  pressedStyle?: StyleProp<ViewStyle>
  /**
   * An optional style override for the button text.
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * An optional style override for the button text when in the "pressed" state.
   */
  pressedTextStyle?: StyleProp<TextStyle>
  /**
   * One of the different types of button presets.
   */
  preset?: Presets
  /**
   * Text which is looked up via i18n.
   */
  teriataryBackground?: ColorValue
  /**
   * Children components.
   */
  children?: React.ReactNode
}

/**
 * A component that allows users to take actions and make choices.
 * Wraps the Text component with a Pressable component.
 */
export const Button = (props: ButtonProps) => {
  const { colors } = useTheme()

  const {
    text,
    tx,
    txOptions,
    disabled,
    loading,
    preset = "primary",
    size = "medium",
    style: $viewStyleOverride,
    pressedStyle: $pressedViewStyleOverride,
    textStyle: $textStyleOverride,
    pressedTextStyle: $pressedTextStyleOverride,
    children,
    teriataryBackground = colors.background,
    ...rest
  } = props

  const $viewPresets = {
    primary: [
      $baseViewStyle,
      $sizeStyles.medium,
      {
        backgroundColor: colors.primary,
      },
    ] as StyleProp<ViewStyle>,

    secondary: [
      $baseViewStyle,
      $sizeStyles.medium,
      {
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.background,
      },
    ] as StyleProp<ViewStyle>,

    teriatary: [
      $baseViewStyle,
      $sizeStyles.medium,
      { backgroundColor: teriataryBackground, paddingHorizontal: 0 },
    ] as StyleProp<ViewStyle>,
  }

  const $textPresets: Record<Presets, StyleProp<TextStyle>> = {
    primary: [$baseTextStyle, { color: colors.white }],
    secondary: [$baseTextStyle, { color: colors.primary }],
    teriatary: [$baseTextStyle, { color: colors.primary }],
  }

  // Button Pressed
  const $pressedViewPresets: Record<Presets, StyleProp<ViewStyle>> = {
    primary: { backgroundColor: colors.primaryClick },
    secondary: { backgroundColor: colors.palette.neutral2, borderColor: colors.primaryClick },
    teriatary: { backgroundColor: teriataryBackground },
  }

  const $pressedTextPresets: Record<Presets, StyleProp<TextStyle>> = {
    primary: { opacity: 0.9 },
    secondary: { opacity: 0.9, color: colors.primaryClick },
    teriatary: { opacity: 0.9, color: colors.primaryClick },
  }

  // Button Disable
  const $disabledViewStyle: Record<Presets, StyleProp<ViewStyle>> = {
    primary: { backgroundColor: colors.primary, opacity: 0.5 },
    secondary: { opacity: 0.7, borderColor: colors.palette.neutral5 },
    teriatary: { backgroundColor: teriataryBackground },
  }

  const $disabledTextStyle: StyleProp<TextStyle> = {
    color: colors.disable,
  }

  // Button Loading
  const $loadingStyle: Record<Presets, StyleProp<ViewStyle>> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.background },
    teriatary: { backgroundColor: teriataryBackground },
  }

  const $activityColor: Record<Presets, ColorValue> = {
    primary: colors.white,
    secondary: colors.primary,
    teriatary: colors.primary,
  }

  function $viewStyle({ pressed }: PressableStateCallbackType) {
    return [
      $viewPresets[preset],
      $sizeStyles[size],
      !!disabled && $disabledViewStyle[preset],
      !!pressed && [$pressedViewPresets[preset], $pressedViewStyleOverride],
      // $viewStyleOverride,
    ]
  }
  function $textStyle({ pressed }: PressableStateCallbackType) {
    return [
      $textPresets[preset],
      $sizeStyles[size],
      !!disabled && $disabledTextStyle,
      !!pressed && [$pressedTextPresets[preset], $pressedTextStyleOverride],
      $textStyleOverride,
    ]
  }

  return (
    <View style={$viewStyleOverride}>
      <Pressable disabled={disabled} style={$viewStyle} accessibilityRole="button" {...rest}>
        {(state) => (
          <>
            <Text
              preset="bold"
              text={text}
              tx={tx}
              txOptions={txOptions}
              style={$textStyle(state)}
            />

            {children}
          </>
        )}
      </Pressable>
      {loading && (
        <View style={[$baseLoadingStyle, $loadingStyle[preset], $sizeStyles[size]]}>
          <ActivityIndicator size={17} color={$activityColor[preset]} />
        </View>
      )}
    </View>
  )
}

const $baseViewStyle: ViewStyle = {
  paddingHorizontal: 12,
  minHeight: 28,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  overflow: "hidden",
  paddingVertical: 12,
}

const $baseTextStyle: TextStyle = {
  fontSize: 16,
  lineHeight: 20,
  textAlign: "center",
  flexShrink: 1,
  flexGrow: 0,
  zIndex: 2,
}

const $baseLoadingStyle: StyleProp<ViewStyle> = [
  StyleSheet.absoluteFill,
  $baseViewStyle,
  { zIndex: 3 },
]

const $sizeStyles = {
  large: { paddingVertical: 10 } as ViewStyle,
  medium: { paddingVertical: 6 } as ViewStyle,
  small: { paddingVertical: 4 } as ViewStyle,
}
