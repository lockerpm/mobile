import * as React from "react"
import { TouchableOpacity } from "react-native"
import { Text } from "../text/text"
import { viewPresets, textPresets } from "./button.presets"
import { ButtonProps } from "./button.props"
import { Button as NativeBaseButton } from 'native-base'
import { translate } from "../../i18n"

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export function Button(props: ButtonProps) {
  // grab the props
  const {
    preset = "primary",
    tx,
    text,
    style: styleOverride,
    textStyle: textStyleOverride,
    children,

    // Native base
    isNativeBase = false,
    colorScheme = 'csGreen',
    variant,
    isDisabled,
    isLoading,
    startIcon,
    endIcon,
    ...rest
  } = props

  const viewStyle = viewPresets[preset] || viewPresets.primary
  const viewStyles = [viewStyle, styleOverride]
  const textStyle = textPresets[preset] || textPresets.primary
  let textStyles = [textStyle, textStyleOverride]

  const content = children || (
    isNativeBase 
      ? (tx ? translate(tx) : text) 
      : <Text tx={tx} text={text} style={textStyles} />
  )

  return isNativeBase ? (
    <NativeBaseButton
      _text={{
        fontSize: 'sm',
        fontWeight: 400
      }}
      colorScheme={colorScheme}
      variant={variant}
      isLoading={isLoading}
      isDisabled={isDisabled}
      startIcon={startIcon}
      endIcon={endIcon}
      style={styleOverride}
      {...rest}
    >
      {content}
    </NativeBaseButton>
  ) : (
    <TouchableOpacity style={viewStyles} {...rest}>
      {content}
    </TouchableOpacity>
  )
}
