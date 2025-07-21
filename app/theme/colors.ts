const palette = {
  // Neutra Color Palette
  neutral1: "#ffffff",
  neutral2: "#fafafa",
  neutral3: "#f5f5f5",
  neutral4: "#f0f0f0",
  neutral5: "#bfbfbf",
  neutral6: "#8c8c8c",
  neutral7: "#595959",
  neutral8: "#434343",
  neutral9: "#262626",

  primary1: "#b6c2b6",
  primary2: "#a8b5a9",
  primary3: "#82a884",
  primary4: "#5f9c64",
  primary5: "#408f49",
  primary6: "#268334",
  primary7: "#165c23",

  green6: "#52c41a",
  blue6: "#1890ff",
  gold6: "#faad14",
  red5: "#C03403",

  // Sunset Orange
  orange1: "#fff7e6",
  orange2: "#ffe7ba",
  orange3: "#ffd591",
  orange4: "#ffc069",
  orange5: "#ffa940",
  orange6: "#fa8c16",
  orange7: "#d46b08",
  orange8: "#ad4e00",
  orange9: "#873800",
  orange10: "#612500",

  toastBackground: "rgba(66, 61, 63, 0.9)",
  transparentModal: "rgba(25, 16, 21, 0.6)",
} as const

export const colors = {
  palette,
  white: "#ffffff",
  black: "#000000",
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  transparentModal: palette.transparentModal,

  toastBackground: palette.toastBackground,
  /**
   * Brand Color
   */
  primary: palette.primary6,

  /**
   * Button Color onClick
   */
  primaryClick: palette.primary7,

  /**
   * Functional color
   */
  link: palette.blue6,
  success: palette.green6,
  warning: palette.gold6,
  error: palette.red5,

  /**
   * Neutral color
   * Neutral color is mainly used in a large part of the text interface,
   * in addition to the background, borders, dividing lines, and other scenes are also very common.
   * Neutral color definition needs to consider the difference between dark background
   * and light background, while incorporating the WCAG 2.0 standard.
   * The neutral color of CyStack is based on transparency, as shown on the right:
   */
  title: palette.neutral9,
  text: palette.neutral9,
  label: palette.neutral6,
  disable: palette.neutral5,
  border: palette.neutral4,
  divider: palette.neutral2,
  background: palette.neutral1,
  block: palette.neutral3,
} as const
