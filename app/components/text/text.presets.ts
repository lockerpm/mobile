import { TextStyle } from "react-native"
import { color, typography, fontSize } from "../../theme"

/**
 * All text will start off looking like this.
 */
const BASE: TextStyle = {
  fontFamily: typography.primary,
  color: color.text,
  fontSize: fontSize.p,
}

/**
 * All the variations of text styling within the app.
 *
 * You want to customize these to whatever you need in your app.
 */
export const presets = {
  /**
   * The default text styles.
   */
  default: BASE,

  // Colored
  black: { ...BASE, color: color.textBlack } as TextStyle,
  green: { ...BASE, color: color.palette.green } as TextStyle,

  /**
   * A bold version of the default text.
   */
  bold: { ...BASE, fontWeight: "bold", color: color.title } as TextStyle,

  /**
   * A semibold version of the default text.
   */
  semibold: { ...BASE, fontWeight: "600", color: color.title } as TextStyle,

  /**
   * headers.
   */
  header: { ...BASE, fontSize: fontSize.h2, fontWeight: '600', color: color.title } as TextStyle,

  /**
   * Large headers.
   */
   largeHeader: { ...BASE, fontSize: fontSize.h1, fontWeight: 'bold', color: color.title } as TextStyle
}

/**
 * A list of preset names.
 */
export type TextPresets = keyof typeof presets
