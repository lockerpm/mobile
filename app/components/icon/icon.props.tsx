import { ImageStyle, StyleProp, ViewStyle } from "react-native"
import { IconTypes } from "./icons"

export interface IconProps {
  style?: StyleProp<ImageStyle>
  containerStyle?: StyleProp<ViewStyle>
  icon?: IconTypes
  size?: number
  color?: string
}
