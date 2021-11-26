import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color as colorLight, colorDark } from "../../theme"
import { flatten } from "ramda"
import { useStores } from "../../models"


export interface DividerProps {
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const Divider = observer(function Divider(props: DividerProps) {
  const { style } = props
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  const CONTAINER: ViewStyle = {
    width: '100%',
    borderColor: color.line,
    borderBottomWidth: 0.5
  }
  const styles = flatten([CONTAINER, style])

  return (
    <View style={styles} />
  )
})
