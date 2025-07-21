const palette = {
  // Neutra Color Palette
  neutral9: "#ffffff",
  neutral8: "#fafafa",
  neutral7: "#f5f5f5",
  neutral6: "#d0d0d0",
  neutral5: "#bfbfbf",
  neutral4: "#8c8c8c",
  neutral3: "#595959",
  neutral2: "#434343",
  neutral1: "#262626",

  primary1: "#b6c2b6",
  primary2: "#a8b5a9",
  primary3: "#82a884",
  primary4: "#5f9c64",
  primary5: "#408f49",
  primary6: "#268334",
  primary7: "#165c23",

  blue6: "#177ddc",
  green6: "#49aa19",
  gold6: "#d89614",
  red5: "#C03403",

  // Sunset Orange
  orange1: "#2b1d11",
  orange2: "#442a11",
  orange3: "#593815",
  orange4: "#7c4a15",
  orange5: "#aa6215",
  orange6: "#d87a16",
  orange7: "#e89a3c",
  orange8: "#f3b765",
  orange9: "#f8cf8d",
  orange10: "#fae3b7",

  toastBackground: "rgba(203, 202, 203, 0.9)",
  transparentModal: "rgba(25, 16, 21, 0.6)",
} as const

export const colors = {
  palette,
  white: "#ffffff",
  black: "#000000",
  transparent: "rgba(0, 0, 0, 0)",
  transparentModal: palette.transparentModal,
  toastBackground: palette.toastBackground,
  primary: palette.primary6,
  primaryClick: palette.primary7,
  link: palette.blue6,
  success: palette.green6,
  warning: palette.gold6,
  error: palette.red5,

  title: palette.neutral9,
  text: palette.neutral9,
  label: palette.neutral6,
  disable: palette.neutral5,
  border: palette.neutral3,
  divider: palette.neutral2,
  background: palette.neutral1,
  block: palette.neutral3,
} as const
