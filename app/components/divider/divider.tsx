import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { flatten } from "ramda"
import { useMixins } from "../../services/mixins"


export interface DividerProps {
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const Divider = function Divider(props: DividerProps) {
  const { style } = props
  const { color } = useMixins()

  const CONTAINER: ViewStyle = {
    width: '100%',
    borderColor: color.line,
    borderBottomWidth: 0.5
  }
  const styles = flatten([CONTAINER, style])

  return (
    <View style={styles} />
  )
}
