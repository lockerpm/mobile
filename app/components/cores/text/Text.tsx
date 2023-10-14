import i18n from 'i18n-js'
import React from 'react'
import {
  StyleProp,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
  ColorValue,
} from 'react-native'
import { isRTL, TxKeyPath } from '../../../i18n'
import { typography } from '../../../theme'
import { useTheme } from 'app/services/context'
import { useHelper } from 'app/services/hook'

type Sizes = keyof typeof $sizeStyles
type Weights = keyof typeof typography.primary
type Presets = keyof typeof $presets

export interface TextProps extends RNTextProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: i18n.TranslateOptions
  /**
   * An optional color.
   */
  color?: ColorValue
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<TextStyle>
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * Text weight modifier.
   */
  weight?: Weights
  /**
   * Text size modifier.
   */
  size?: Sizes
  /**
   * Children components.
   */
  children?: React.ReactNode
}

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-Text.md)
 */
export function Text(props: TextProps) {
  const {
    weight,
    size,
    tx,
    txOptions,
    text,
    children,
    style: $styleOverride,
    color,
    ...rest
  } = props

  const { colors } = useTheme()
  const { translate } = useHelper()

  const i18nText = tx && translate(tx, txOptions)
  const content = i18nText || text || children

  const preset: Presets = $presets[props.preset] ? props.preset : 'default'

  const $colorPreset = {
    default: { color: colors.primaryText },
    bold: { color: colors.primaryText },
    heading: { color: colors.primaryText },
    label: { color: colors.secondaryText },
    helper: { color: colors.secondaryText },
  }
  const $styles: StyleProp<TextStyle> = [
    $rtlStyle,
    $presets[preset],
    $fontWeightStyles[weight],
    $sizeStyles[size],
    color ? { color } : $colorPreset[preset],
    $styleOverride,
  ]

  return (
    <RNText {...rest} style={$styles}>
      {content}
    </RNText>
  )
}

const $sizeStyles = {
  xxxl: { fontSize: 28, lineHeight: 46 },
  xxl: { fontSize: 30, lineHeight: 38 },
  xl: { fontSize: 24, lineHeight: 32 },
  large: { fontSize: 20, lineHeight: 28 },
  medium: { fontSize: 16, lineHeight: 24 },
  base: { fontSize: 14, lineHeight: 22 },
  small: { fontSize: 12, lineHeight: 20 },
  sx: { fontSize: 10, lineHeight: 18 },
}

const $fontWeightStyles = Object.entries(typography.primary).reduce((acc, [weight, fontFamily]) => {
  return { ...acc, [weight]: { fontFamily } }
}, {}) as Record<Weights, TextStyle>

const $baseStyle: StyleProp<TextStyle> = [$sizeStyles.medium, $fontWeightStyles.regular]

const $presets = {
  default: $baseStyle,

  bold: [$baseStyle, $fontWeightStyles.medium] as StyleProp<TextStyle>,

  heading: [$baseStyle, $sizeStyles.xl, $fontWeightStyles.medium] as StyleProp<TextStyle>,

  label: [$baseStyle] as StyleProp<TextStyle>,

  helper: [$baseStyle, $sizeStyles.small] as StyleProp<TextStyle>,
}

const $rtlStyle: TextStyle = isRTL ? { writingDirection: 'rtl' } : {}
