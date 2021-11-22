import React from "react"
import { observer } from "mobx-react-lite"
import { Screen } from "../screen/screen"
import { Container } from "../container/container"
import { StyleProp, View, ViewStyle } from "react-native"
import { commonStyles, color as colorLight, colorDark } from "../../theme"
import { useStores } from "../../models"

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
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  return (
    <Screen 
      preset="fixed" 
      isLoading={props.isScreenLoading} 
      isOverlayLoading={props.isOverlayLoading}
      style={props.style}
      hasFooter={!!props.footer}
    >
      {
        props.header && (
          <View style={[commonStyles.SECTION_PADDING, {
            backgroundColor: color.background
          }]}>
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
          <View style={[commonStyles.SECTION_PADDING, {
            backgroundColor: color.background
          }]}>
            {props.footer}
          </View>
        )
      }
    </Screen>
  )
})
