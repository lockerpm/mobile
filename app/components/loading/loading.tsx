import * as React from "react"
import { StyleProp, View, ViewStyle, ActivityIndicator } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"
import { color } from "../../theme"
import { Text } from "../text/text"


const CONTAINER: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  flex: 1
}

const OVERLAY_CONTAINER: ViewStyle = {
  flex: 1,
  position: 'absolute',
  height: '100%',
  width: '100%',
  top: 0,
  left: 0,
  zIndex: 1000,
  backgroundColor: 'white',
  opacity: 0.8,
  justifyContent: "center",
  alignItems: "center"
}


export interface LoadingProps {
  style?: StyleProp<ViewStyle>
  message?: string
}

/**
 * Describe your component here
 */
export const Loading = observer(function Loading(props: LoadingProps) {
  const { style, message } = props
  const styles = flatten([CONTAINER, style])

  return (
    <View style={styles}>
      <ActivityIndicator size="large" color={color.palette.green} />
      {
        !!message && (
          <Text
            text={message}
            style={{
              marginTop: 10
            }}
          />
        )
      }
    </View>
  )
})

export const OverlayLoading = observer(function OverlayLoading(props: LoadingProps) {
  const { style } = props
  const styles = flatten([OVERLAY_CONTAINER, style])

  return (
    <View style={styles}>
      <ActivityIndicator size="large" color={color.palette.green} />
    </View>
  )
})