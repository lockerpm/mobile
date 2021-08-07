import React from "react"
import { StyleProp, ViewStyle } from "react-native"

export interface ContainerProps {
  /**
   * Children components.
   */
  children?: React.ReactNode

  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  /**
   * Is full screen loading? Defaults to false.
   */
  isLoading?: boolean,

  /**
   * Is overlay loading? Defaults to false.
   */
   isOverlayLoading?: boolean,

  /**
   * Is fixed or scroll view? Defaults to scroll.
   */
   noScroll?: boolean

   borderTop?: boolean,
   borderBottom?: boolean
}
