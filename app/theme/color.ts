import { palette } from "./palette"

/**
 * Roles for colors.  Prefer using these over the palette.  It makes it easier
 * to change things.
 *
 * The only roles we need to place in here are the ones that span through the app.
 *
 * If you have a specific use-case, like a spinner color.  It makes more sense to
 * put that in the <Spinner /> component.
 */
export const color = {
  /**
   * The palette is available to use, but prefer using the name.
   */
  palette,
  /**
   * A helper for making something see-thru. Use sparingly as many layers of transparency
   * can cause older Android devices to slow down due to the excessive compositing required
   * by their under-powered GPUs.
   */
  toastBackground: 'rgba(22, 22, 22, 0.9)',
  transparent: "rgba(0, 0, 0, 0)",
  background: palette.white,
  disabled: palette.gray,
  line: palette.lightGray,
  block: palette.lighterGray,
  text: palette.lighterBlack,
  textBlack: palette.lightBlack,
  title: palette.black,
  lightPrimary: palette.lightGreen,
  primary: palette.green,
  error: palette.danger,
  warning: palette.warning,
  info: palette.blue,
  white: palette.white,
  orange: palette.orange,
}
