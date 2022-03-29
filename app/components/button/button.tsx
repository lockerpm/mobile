import { observer } from "mobx-react-lite"
import * as React from "react"
import { ActivityIndicator, TouchableOpacity, View } from "react-native"
import { useStores } from "../../models"
import { Text } from "../text/text"
import { viewPresets, textPresets, viewPresetsDark, textPresetsDark } from "./button.presets"
import { ButtonProps } from "./button.props"

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export const Button = observer(function Button(props: ButtonProps) {
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

  const { uiStore } = useStores()

  const viewStyle = uiStore.isDark ? (
    viewPresetsDark[preset] || viewPresetsDark.primary
  ) : (
    viewPresets[preset] || viewPresets.primary
  )
  const viewStyles = [viewStyle, styleOverride]
  const textStyle = uiStore.isDark ? (
    textPresetsDark[preset] || textPresetsDark.primary
  ) : (
    textPresets[preset] || textPresets.primary
  )
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
          <View  style={{ marginRight: 3 }}>
            <ActivityIndicator size="small" color={textStyle.color} />
          </View>
        )
      }
      {content}
    </TouchableOpacity>
  )
})
