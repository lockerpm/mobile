import { observer } from 'mobx-react-lite'
import React, { ComponentType } from 'react'
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
} from 'react-native'
import { useMixins } from '../../../services/mixins'
import { Text, TextProps } from '../text/text'

type Presets = 'primary' | 'secondary' | 'teriatary'
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
  text?: TextProps['text']
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
   * An optional component to render on the right side of the text.
   * Example: `RightAccessory={(props) => <View {...props} />}`
   */
  RightAccessory?: ComponentType<ButtonAccessoryProps>
  /**
   * An optional component to render on the left side of the text.
   * Example: `LeftAccessory={(props) => <View {...props} />}`
   */
  LeftAccessory?: ComponentType<ButtonAccessoryProps>
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
export const Button = observer((props: ButtonProps) => {
  const { color: colors } = useMixins()

  const {
    text,
    disabled,
    loading,
    size = 'medium',
    style: $viewStyleOverride,
    pressedStyle: $pressedViewStyleOverride,
    textStyle: $textStyleOverride,
    pressedTextStyle: $pressedTextStyleOverride,
    children,
    RightAccessory,
    LeftAccessory,
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
      { backgroundColor: teriataryBackground },
    ] as StyleProp<ViewStyle>,
  }

  const $textPresets: Record<Presets, StyleProp<TextStyle>> = {
    primary: [$baseTextStyle, { color: colors.palette.white }],
    secondary: [$baseTextStyle, { color: colors.primary }],
    teriatary: [$baseTextStyle, { color: colors.primary }],
  }

  // Button Pressed
  const $pressedViewPresets: Record<Presets, StyleProp<ViewStyle>> = {
    primary: { backgroundColor: colors.primary },
    secondary: {
      backgroundColor: colors.palette.lightGreen,
      borderColor: colors.palette.lightGreen,
    },
    teriatary: { backgroundColor: teriataryBackground },
  }

  const $pressedTextPresets: Record<Presets, StyleProp<TextStyle>> = {
    primary: { opacity: 0.9 },
    secondary: { opacity: 0.9, color: colors.palette.lightGreen },
    teriatary: { opacity: 0.9, color: colors.palette.lightGreen },
  }

  // Button Disable
  const $disabledViewStyle: Record<Presets, StyleProp<ViewStyle>> = {
    primary: { backgroundColor: colors.disabled },
    secondary: { backgroundColor: colors.line, borderColor: colors.disabled },
    teriatary: { backgroundColor: teriataryBackground },
  }

  const $disabledTextStyle: StyleProp<TextStyle> = {
    color: 'gray',
  }

  // Button Loading
  const $loadingStyle: Record<Presets, StyleProp<ViewStyle>> = {
    primary: { backgroundColor: colors.palette.lightGreen },
    secondary: { backgroundColor: colors.background },
    teriatary: { backgroundColor: teriataryBackground },
  }

  const $activityColor: Record<Presets, ColorValue> = {
    primary: colors.palette.white,
    secondary: colors.primary,
    teriatary: colors.primary,
  }

  const preset: Presets = $viewPresets[props.preset] ? props.preset : 'primary'

  function $viewStyle({ pressed }) {
    return [
      $viewPresets[preset],
      $sizeStyles[size],
      !!disabled && $disabledViewStyle[preset],
      !!pressed && [$pressedViewPresets[preset], $pressedViewStyleOverride],
      $viewStyleOverride,
    ]
  }
  function $textStyle({ pressed }) {
    return [
      $textPresets[preset],
      $sizeStyles[size],
      !!disabled && $disabledTextStyle,
      !!pressed && [$pressedTextPresets[preset], $pressedTextStyleOverride],
      $textStyleOverride,
    ]
  }

  return (
    <Pressable disabled={disabled} style={$viewStyle} accessibilityRole="button" {...rest}>
      {(state) => (
        <>
          {!!LeftAccessory && <LeftAccessory style={$leftAccessoryStyle} pressableState={state} />}

          <Text text={text} style={$textStyle(state)} />

          {children}

          {!!RightAccessory && (
            <RightAccessory style={$rightAccessoryStyle} pressableState={state} />
          )}
          {loading && (
            <View style={[$baseLoadingStyle, $loadingStyle[preset], $sizeStyles[size]]}>
              <ActivityIndicator size={17} color={$activityColor[preset]} />
            </View>
          )}
        </>
      )}
    </Pressable>
  )
})

const $baseViewStyle: ViewStyle = {
  paddingHorizontal: 16,
  minHeight: 28,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
  overflow: 'hidden',
  paddingVertical: 16,
}

const $baseTextStyle: TextStyle = {
  fontSize: 16,
  lineHeight: 20,
  textAlign: 'center',
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
  large: { paddingVertical: 8 } as ViewStyle,
  medium: { paddingVertical: 6 } as ViewStyle,
  small: { paddingVertical: 4 } as ViewStyle,
}

const $rightAccessoryStyle: ViewStyle = { marginLeft: 8 }
const $leftAccessoryStyle: ViewStyle = { marginRight: 8 }
