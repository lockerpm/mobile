import { ViewStyle } from "react-native";
import { color } from "./color";

const CENTER_VIEW: ViewStyle = {
  flex: 1,
  justifyContent: "center", 
  alignItems: "center"
}

const CENTER_HORIZONTAL_VIEW: ViewStyle = {
  // flex: 1,
  flexDirection: "row", 
  alignItems: "center"
}

const SECTION_PADDING: ViewStyle = {
  paddingHorizontal: 20, 
  paddingVertical: 16
}

const GRAY_SCREEN_SECTION: ViewStyle = {
  paddingHorizontal: 20,
  backgroundColor: color.palette.white
}

export const commonStyles = {
  CENTER_VIEW,
  SECTION_PADDING,
  CENTER_HORIZONTAL_VIEW,
  GRAY_SCREEN_SECTION
}