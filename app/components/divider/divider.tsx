import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color } from "../../theme"
import { flatten } from "ramda"

const CONTAINER: ViewStyle = {
  width: '100%',
  borderColor: color.line,
  borderBottomWidth: 1
}

export interface DividerProps {
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const Divider = observer(function Divider(props: DividerProps) {
  const { style } = props
  const styles = flatten([CONTAINER, style])

  return (
    <View style={styles} />
  )
})
