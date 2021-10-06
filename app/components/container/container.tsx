import * as React from "react"
import { ScrollView, View } from "react-native"
import { ContainerProps } from "./container.props"
import { OverlayLoading, Loading } from "../loading/loading"
import { color } from "../../theme"
import { ViewStyle } from "react-native"


export function Container(props: ContainerProps) {
  const preset = {
    outer: {
      backgroundColor: color.background,
      flex: 1
    } as ViewStyle,
    inner: {
      justifyContent: "flex-start",
      alignItems: "stretch",
      paddingTop: 16,
      paddingBottom: 32,
      paddingHorizontal: 20,
      minHeight: '100%'
    } as ViewStyle,
  }
  const style = props.style || {}

  let borderStyle = {}
  if (props.borderTop) {
    borderStyle = {
      borderTopWidth: 1,
      borderTopColor: color.line
    }
  }
  if (props.borderBottom) {
    borderStyle = {
      ...borderStyle,
      borderBottomWidth: 1,
      borderBottomColor: color.line
    }
  }

  return props.isLoading ? (
    <Loading />
  ) : (
    <View style={[preset.outer, borderStyle]}>
      {props.isOverlayLoading && <OverlayLoading />}
      {
        !props.noScroll ? (
          <ScrollView
            bounces={false}
            style={preset.outer}
            contentContainerStyle={[preset.inner, style]}
          >
            {props.children}
          </ScrollView>
        ) : props.children
      }
    </View>
  )
}
