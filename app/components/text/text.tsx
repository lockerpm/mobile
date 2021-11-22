import * as React from "react"
import { Text as ReactNativeText } from "react-native"
import { presets, presetsDark } from "./text.presets"
import { TextProps } from "./text.props"
import { translate } from "../../i18n"
import { observer } from "mobx-react-lite"
import { useStores } from "../../models"

/**
 * For your text displaying needs.
 *
 * This component is a HOC over the built-in React Native one.
 */
export const Text = observer(function Text(props: TextProps) {
  // grab the props
  const { preset = "default", tx, txOptions, text, children, style: styleOverride, ...rest } = props

  const { uiStore } = useStores()

  // figure out which content to use
  const i18nText = tx && translate(tx, txOptions)
  const content = i18nText || text || children

  const style = uiStore.isDark 
    ? (presetsDark[preset] || presetsDark.default)
    : (presets[preset] || presets.default)
  const styles = [style, styleOverride]

  return (
    <ReactNativeText {...rest} style={styles}>
      {content}
    </ReactNativeText>
  )
})
