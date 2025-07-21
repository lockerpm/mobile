import { ViewStyle } from "react-native"

/* Use this file to define styles that are used in multiple places in your app. */
export const $styles: Record<string, ViewStyle> = {
  row: { flexDirection: "row" },
  flex1: { flex: 1 },
  flexWrap: { flexWrap: "wrap" },

  toggleInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
}
