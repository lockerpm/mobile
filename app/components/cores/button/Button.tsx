import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  ViewStyle,
  View,
  ActivityIndicator,
} from "react-native"

import { type ThemedStyle, type ThemedStyleArray } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { Text, TextProps } from "../text/Text"

type Presets = "primary" | "secondary" | "teriatary" | "delete"

export interface ButtonAccessoryProps {
  style: StyleProp<any>
  pressableState: PressableStateCallbackType
  disabled?: boolean
}

export interface ButtonProps extends PressableProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TextProps["tx"]
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: TextProps["text"]
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TextProps["txOptions"]
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * An optional style override for the button text.
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * One of the different types of button presets.
   */
  preset?: Presets
  /**
   * Children components.
   */
  children?: React.ReactNode
  /**
   * disabled prop, accessed directly for declarative styling reasons.
   */
  disabled?: boolean
  /**
   * The Button is performing a long action
   */
  loading?: boolean
}

/**
 * A component that allows users to take actions and make choices.
 * Wraps the Text component with a Pressable component.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Button/}
 * @param {ButtonProps} props - The props for the `Button` component.
 * @returns {JSX.Element} The rendered `Button` component.
 * @example
 * <Button
 *   tx="common:ok"
 *   style={styles.button}
 *   textStyle={styles.buttonText}
 *   onPress={handleButtonPress}
 * />
 */
export function Button(props: ButtonProps) {
  const {
    tx,
    text,
    txOptions,
    style: $viewStyleOverride,
    textStyle: $textStyleOverride,
    children,
    disabled,
    loading,
    ...rest
  } = props

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const preset: Presets = props.preset ?? "primary"
  /**
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<ViewStyle>} The view style based on the pressed state.
   */
  function $viewStyle({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> {
    return [
      themed($viewPresets[preset]),
      !!pressed && themed([$pressedViewPresets[preset]]),
      !!disabled && themed([$disabledViewStyle[preset]]),
    ]
  }
  /**
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<TextStyle>} The text style based on the pressed state.
   */
  function $textStyle({ pressed }: PressableStateCallbackType): StyleProp<TextStyle> {
    return [
      themed($textPresets[preset]),
      $textStyleOverride,
      !!pressed && themed([$pressedTextPresets[preset]]),
      !!disabled && themed([$disabledTextStyle]),
    ]
  }

  return (
    <View style={$viewStyleOverride}>
      <Pressable
        style={$viewStyle}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        {...rest}
        disabled={disabled || loading}
      >
        {(state) => (
          <>
            <Text
              tx={!loading ? tx : undefined}
              text={!loading ? text : undefined}
              txOptions={txOptions}
              style={$textStyle(state)}
            >
              {children}
            </Text>
          </>
        )}
      </Pressable>
      {loading && (
        <View style={themed([$baseViewStyle, $baseLoadingStyle])}>
          <ActivityIndicator
            size={17}
            color={preset === "primary" || preset === "delete" ? colors.white : colors.primary}
          />
        </View>
      )}
    </View>
  )
}

const $baseViewStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: 44,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  overflow: "hidden",
})

const $baseTextStyle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
  color: colors.primary,
  textAlign: "center",
  flexShrink: 1,
  flexGrow: 0,
  zIndex: 2,
})

const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  primary: [
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.primary,
    }),
  ],
  secondary: [
    $baseViewStyle,
    ({ colors }) => ({
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.background,
    }),
  ],
  teriatary: [$baseViewStyle, ({ colors }) => ({ backgroundColor: colors.transparent })],
  delete: [$baseViewStyle, ({ colors }) => ({ backgroundColor: colors.error })],
}

const $textPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  primary: [$baseTextStyle, ({ colors }) => ({ color: colors.white })],
  secondary: [$baseTextStyle],
  teriatary: [$baseTextStyle],
  delete: [$baseTextStyle, ({ colors }) => ({ color: colors.white })],
}

const $pressedViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  primary: ({ colors }) => ({ backgroundColor: colors.primaryClick }),
  secondary: ({ colors }) => ({
    backgroundColor: colors.palette.neutral2,
    borderColor: colors.primaryClick,
  }),
  teriatary: ({ colors }) => ({ backgroundColor: colors.transparent }),
  delete: () => ({ opacity: 0.8 }),
}

const $pressedTextPresets: Record<Presets, ThemedStyle<TextStyle>> = {
  primary: () => ({ opacity: 0.9 }),
  secondary: () => ({ opacity: 0.9 }),
  teriatary: () => ({ opacity: 0.7 }),
  delete: () => ({ opacity: 0.7 }),
}

// Button Disable
const $disabledViewStyle: Record<Presets, ThemedStyle<ViewStyle>> = {
  primary: ({ colors }) => ({ backgroundColor: colors.primary, opacity: 0.5 }),
  secondary: ({ colors }) => ({ opacity: 0.7, borderColor: colors.palette.neutral5 }),
  teriatary: ({ colors }) => ({ backgroundColor: colors.transparent }),
  delete: ({ colors }) => ({ backgroundColor: colors.error, opacity: 0.5 }),
}

const $disabledTextStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.disable,
})

const $baseLoadingStyle: StyleProp<ViewStyle> = [
  { zIndex: 3, position: "absolute", top: 0, left: 0, bottom: 0, right: 0 },
]
