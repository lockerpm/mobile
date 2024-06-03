import { Platform } from "react-native"

const fonts = {
  inter: {
    // Cross-platform Google font.
    regular: Platform.select({
      ios: "Inter-Regular",
      android: "Inter-Regular",
    }),
    medium: Platform.select({
      ios: "Inter-Medium",
      android: "Inter-Medium",
    }),
    semibold: Platform.select({
      ios: "Inter-SemiBold",
      android: "Inter-SemiBold",
    }),
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.inter,

  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: "System", android: "System" }),
}
