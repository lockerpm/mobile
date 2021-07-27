import * as React from "react"
import { StyleProp, View, ViewStyle, ActivityIndicator } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  flex: 1
}


export interface LoadingProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const Loading = observer(function Loading(props: LoadingProps) {
  const { style } = props
  const styles = flatten([CONTAINER, style])

  return (
    <View style={styles}>
      <ActivityIndicator size="large" color="green" />
    </View>
  )
})
