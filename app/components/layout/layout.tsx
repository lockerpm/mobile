import React, { useEffect, useState } from "react"
import { Screen } from "../screen/screen"
import { Container } from "../container/container"
import { StyleProp, View, ViewStyle, Keyboard } from "react-native"
import { commonStyles } from "../../theme"
import { useMixins } from "../../services/mixins"

export interface LayoutProps {
  children?: React.ReactNode
  isScreenLoading?: boolean
  isOverlayLoading?: boolean
  isContentLoading?: boolean
  isContentOverlayLoading?: boolean
  header?: JSX.Element
  footer?: JSX.Element
  noScroll?: boolean
  borderTop?: boolean
  borderBottom?: boolean
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  hasBottomNav?: boolean
}

/**
 * Describe your component here
 */
export const Layout = function Layout(props: LayoutProps) {
  const { color, isDark } = useMixins()

  const [isKeyboradShow, setIsKeyboradShow] = useState(false)

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboradShow(true)
    })
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboradShow(false)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  return (
    <Screen 
      preset="fixed" 
      isLoading={props.isScreenLoading} 
      isOverlayLoading={props.isOverlayLoading}
      style={props.style}
      hasFooter={!!props.footer}
      hasBottomNav={props.hasBottomNav}
      statusBar={isDark ? "light-content" : "dark-content"}
      backgroundColor={color.background}
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
        !isKeyboradShow && props.footer && (
          <View style={[commonStyles.SECTION_PADDING, {
            backgroundColor: color.background
          }]}>
            {props.footer}
          </View>
        )
      }
    </Screen>
  )
}
