import * as React from "react"
import { observer } from "mobx-react-lite"
import { Screen } from "../screen/screen"
import { Container } from "../container/container"
import { StyleProp, View, ViewStyle } from "react-native"
import { commonStyles } from "../../theme"

export interface LayoutProps {
  children?: React.ReactNode,
  isScreenLoading?: boolean,
  isOverlayLoading?: boolean,
  isContentLoading?: boolean,
  isContentOverlayLoading?: boolean,
  header?: JSX.Element,
  footer?: JSX.Element,
  noScroll?: boolean,
  borderTop?: boolean,
  borderBottom?: boolean,
  style?: StyleProp<ViewStyle>,
  containerStyle?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const Layout = observer(function Layout(props: LayoutProps) {
  return (
    <Screen 
      preset="fixed" 
      isLoading={props.isScreenLoading} 
      isOverlayLoading={props.isOverlayLoading}
      style={props.style}
    >
      {
        props.header && (
          <View style={commonStyles.SECTION_PADDING}>
            {props.header}
          </View>
        )
      }
      <Container 
        isLoading={props.isContentLoading}
        isOverlayLoading={props.isContentOverlayLoading}
        noScroll={props.noScroll}
        borderTop={props.borderTop}
        borderBottom={props.borderBottom}
        style={props.containerStyle}
      >
        {props.children}
      </Container>
      {
        props.footer && (
          <View style={commonStyles.SECTION_PADDING}>
            {props.footer}
          </View>
        )
      }
    </Screen>
  )
})
