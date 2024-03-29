import { paletteDark, paletteLight } from './palette'

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

  toastBackground: 'rgba(22, 22, 22, 0.9)',
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
  transparentModal: 'rgba(255, 255, 255, 0.1)',

  toastBackground: 'rgba(100, 100, 100, 1)',
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
  error: paletteDark.red6,

  /**
   * Neutral color
   * Neutral color is mainly used in a large part of the text interface,
   * in addition to the background, borders, dividing lines, and other scenes are also very common.
   * Neutral color definition needs to consider the difference between dark background
   * and light background, while incorporating the WCAG 2.0 standard.
   * The neutral color of CyStack is based on transparency, as shown on the right:
   */
  title: paletteDark.neutral1,
  primaryText: paletteDark.neutral2,
  secondaryText: paletteDark.neutral6,
  disable: paletteDark.neutral5,
  border: paletteDark.neutral7,
  divider: paletteDark.neutral8,
  background: '#000000',
  block: paletteDark.neutral9,
}

/**  @see https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4 */
const transparencyForHex = {
  80: 'CC',
  75: 'BF',
  50: '80',
  40: '66',
  20: '33',
  10: '1A',
}

export const colorTransparency = (
  hexColor: string,
  transparency: keyof typeof transparencyForHex
) => {
  return hexColor + transparencyForHex[transparency]
}
