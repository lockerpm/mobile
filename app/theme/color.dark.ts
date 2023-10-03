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
export const colorDark = {
  /**
   * The palette is available to use, but prefer using the name.
   */
  palette,
  /**
   * A helper for making something see-thru. Use sparingly as many layers of transparency
   * can cause older Android devices to slow down due to the excessive compositing required
   * by their under-powered GPUs.
   */
  toastBackground: 'rgba(100, 100, 100, 1)',
  transparent: "rgba(0, 0, 0, 0)",
  background: '#131313',
  disabled: palette.gray,
  line: '#8E8E93',
  block: '#313131',
  text: '#8E8E93',
  textBlack: '#FDFDFD',
  title: '#FDFDFD',
  lightPrimary: palette.lightGreen,
  primary: '#62AD56',
  error: palette.danger,
  warning: palette.warning,
  info: palette.blue,
  white: '#FDFDFD',
  orange: palette.orange,
}