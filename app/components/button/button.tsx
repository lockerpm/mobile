import * as React from "react"
import { ActivityIndicator, TouchableOpacity } from "react-native"
import { Text } from "../text/text"
import { viewPresets, textPresets } from "./button.presets"
import { ButtonProps } from "./button.props"
import { color } from "../../theme"

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
    isDisabled,
    isLoading,
    ...rest
  } = props

  const viewStyle = viewPresets[preset] || viewPresets.primary
  const viewStyles = [viewStyle, styleOverride]
  const textStyle = textPresets[preset] || textPresets.primary
  let textStyles = [textStyle, textStyleOverride]

  const content = children || <Text tx={tx} text={text} style={textStyles} />

  return (
    <TouchableOpacity
      disabled={isDisabled}
      style={[viewStyles, {
        opacity: isDisabled || isLoading ? 0.5 : 1
      }]} 
      {...rest}
    >
      {
        isLoading && (
          <ActivityIndicator size="small" color={textStyle.color} />
        )
      }
      {content}
    </TouchableOpacity>
  )
}
