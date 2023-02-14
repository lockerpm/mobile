import React from 'react'
import {
  ColorValue,
  StyleProp,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { useMixins } from '../../../services/mixins'
import { fontSizes, typography } from '../../../theme'

type Presets = 'default' | 'bold' | 'label'
type Sizes = keyof typeof fontSizes
type Weights = keyof typeof typography.secondary

const AnimatedText = Animated.createAnimatedComponent(RNText)

export interface TextProps extends RNTextProps {
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
   * Text color modifier.
   */
  color?: ColorValue
  /**
   * Children components.
   */
  children?: React.ReactNode
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string
}

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 */
export const Text = (props: TextProps) => {
  const {
    weight,
    size,
    text,
    children,
    style: $styleOverride,
    color: colorValue,
    ...rest
  } = props

  const { color: themeColor } = useMixins()

  const $baseStyle: StyleProp<TextStyle> = [{  
    fontFamily: typography.primary,
    color: themeColor.textBlack,
    fontSize: fontSizes.medium
  }]
  

  const $presetStyles: Record<Presets, StyleProp<TextStyle>> = {
    default: [$baseStyle],

    bold: [$baseStyle, { fontWeight: "600", color: themeColor.title }],

    label: [$baseStyle,  { color: themeColor.text }],
  }

  const content =  text || children
  const preset: Presets = $presetStyles[props.preset] ? props.preset : 'default'

  const $textColor: StyleProp<TextStyle> = [
    colorValue && { color: colorValue },
  ]
  const $styles = [
    $presetStyles[preset],
    $fontSizeStyles[size],
    $textColor,
    $styleOverride,
  ]

  return (
    <AnimatedText {...rest} style={$styles}>
      {content}
    </AnimatedText>
  )
}

const $fontSizeStyles = Object.entries(fontSizes).reduce((acc, [size, fontSize]) => {
  return { ...acc, [size]: { fontSize, lineHeight: (fontSize * 3) / 2 } }
}, {}) as Record<Sizes, TextStyle>



