import React from "react"
import { StyleProp, ScrollView, ViewStyle, useWindowDimensions } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"


const CONTAINER: ViewStyle = {
  width: '100%'
}

export interface ActionSheetContentProps {
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  children?: React.ReactNode
}


/**
 * Describe your component here
 */
export const ActionSheetContent = observer(function ActionSheetContent(props: ActionSheetContentProps) {
  const { style, children, contentContainerStyle } = props
  const styles = flatten([CONTAINER, style])

  const { height } = useWindowDimensions();

  return (
    <ScrollView 
      contentContainerStyle={contentContainerStyle}
      style={[{
        maxHeight: height * 0.5
      }, styles]}
    >
      {children}
    </ScrollView>
  )
})
