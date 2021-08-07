import * as React from "react"
import { observer } from "mobx-react-lite"
import { Screen } from "../screen/screen"
import { Container } from "../container/container"
import { View } from "react-native"
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
  borderBottom?: boolean
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
