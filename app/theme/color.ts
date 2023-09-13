import { palette, paletteDark, paletteLight } from './palette'

// TODO: DEPRECATED
export const color = {
  palette,
  toastBackground: 'rgba(22, 22, 22, 0.9)',
  transparent: 'rgba(0, 0, 0, 0)',
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

// TODO: DEPRECATED
export const colorDark = {
  palette,
  toastBackground: 'rgba(100, 100, 100, 1)',
  transparent: 'rgba(0, 0, 0, 0)',
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

export const colorsLight = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette: paletteLight,

  white: '#ffffff',
  black: '#000000',
  /**
   * A helper for making something see-thru.
   */
  transparent: 'rgba(0, 0, 0, 0)',
  transparentModal: 'rgba(0, 0, 0, 0.3)',
  /**
   * Brand Color
   */
  primary: paletteLight.primary6,

  /**
   * Button Color onClick
   */
  primaryClick: paletteLight.primary7,

  /**
   * Functional color
   */
  link: paletteLight.blue6,
  infoLight: paletteLight.blue1,
  success: paletteLight.green6,
  warning: paletteLight.gold6,
  error: paletteLight.red5,

  /**
   * Neutral color
   * Neutral color is mainly used in a large part of the text interface,
   * in addition to the background, borders, dividing lines, and other scenes are also very common.
   * Neutral color definition needs to consider the difference between dark background
   * and light background, while incorporating the WCAG 2.0 standard.
   * The neutral color of CyStack is based on transparency, as shown on the right:
   */
  title: paletteLight.neutral9,
  primaryText: paletteLight.neutral9,
  secondaryText: paletteLight.neutral6,
  disable: paletteLight.neutral5,
  border: paletteLight.neutral3,
  divider: paletteLight.neutral2,
  background: paletteLight.neutral1,
  block: paletteLight.neutral3,
}

export const colorsDark = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette: paletteDark,

  white: '#ffffff',
  black: '#000000',
  /**
   * A helper for making something see-thru.
   */
  transparent: 'rgba(0, 0, 0, 0)',
  transparentModal: 'rgba(0, 0, 0, 0.3)',
  /**
   * Brand Color
   */
  primary: paletteDark.primary6,

  /**
   * Button Color onClick
   */
  primaryClick: paletteDark.primary7,

  /**
   * Functional color
   */
  link: paletteDark.blue6,
  infoLight: paletteDark.blue1,
  success: paletteDark.green6,
  warning: paletteDark.gold6,
  error: paletteDark.red5,

  /**
   * Neutral color
   * Neutral color is mainly used in a large part of the text interface,
   * in addition to the background, borders, dividing lines, and other scenes are also very common.
   * Neutral color definition needs to consider the difference between dark background
   * and light background, while incorporating the WCAG 2.0 standard.
   * The neutral color of CyStack is based on transparency, as shown on the right:
   */
  title: paletteDark.neutral1,
  primaryText: paletteDark.neutral1,
  secondaryText: paletteDark.neutral5,
  disable: paletteDark.neutral5,
  border: paletteDark.neutral7,
  divider: paletteDark.neutral8,
  background: paletteDark.neutral9,
  block: paletteDark.neutral7,
}
