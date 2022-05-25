import { ViewStyle } from "react-native";
import { color } from "./color";
import { spacing } from "./spacing";

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
  paddingHorizontal: spacing.large, 
  paddingVertical: spacing.medium
}

const GRAY_SCREEN_SECTION: ViewStyle = {
  paddingHorizontal: spacing.large,
  backgroundColor: color.palette.white
}

export const commonStyles = {
  CENTER_VIEW,
  SECTION_PADDING,
  CENTER_HORIZONTAL_VIEW,
  GRAY_SCREEN_SECTION
}