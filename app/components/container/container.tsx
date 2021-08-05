import * as React from "react"
import { ScrollView, View } from "react-native"
import { ContainerProps } from "./container.props"
import { OverlayLoading } from "../loading/loading"
import { color } from "../../theme"
import { ViewStyle } from "react-native"


export function Container(props: ContainerProps) {
  const preset = {
    outer: {
      backgroundColor: color.background,
      flex: 1,
      height: "100%"
    } as ViewStyle,
    inner: {
      justifyContent: "flex-start",
      alignItems: "stretch",
      paddingTop: 16,
      paddingBottom: 32,
      paddingHorizontal: 20
    } as ViewStyle,
  }
  const style = props.style || {}

  return (
    <View style={[preset.outer]}>
      {props.isLoading && <OverlayLoading />}
      {
        !props.noScroll ? (
          <ScrollView
            style={[preset.outer]}
            contentContainerStyle={[preset.inner, style]}
          >
            {props.children}
          </ScrollView>
        ) : props.children
      }
    </View>
  )
}
