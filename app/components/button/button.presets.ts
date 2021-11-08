import { ViewStyle, TextStyle } from "react-native"
import { color, fontSize, spacing } from "../../theme"

/**
 * All text will start off looking like this.
 */
const BASE_VIEW: ViewStyle = {
  paddingVertical: spacing[3],
  paddingHorizontal: spacing[2],
  borderRadius: 4,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: 'row',
  minHeight: 48
}

const BASE_TEXT: TextStyle = {
  paddingHorizontal: spacing[3],
}

/**
 * All the variations of text styling within the app.
 *
 * You want to customize these to whatever you need in your app.
 */
export const viewPresets: Record<string, ViewStyle> = {
  /**
   * A smaller piece of secondard information.
   */
  primary: {
    ...BASE_VIEW,
    backgroundColor: color.palette.green
  } as ViewStyle,

  /**
   * Error
   */
  error: {
    ...BASE_VIEW,
    backgroundColor: color.error
  } as ViewStyle,

  /**
   * Outline
   */
  outline: {
    ...BASE_VIEW,
    backgroundColor: color.palette.white,
    borderColor: color.palette.green,
    borderWidth: 1
  } as ViewStyle,

  /**
   * Outline error
   */
  outlineError: {
    ...BASE_VIEW,
    backgroundColor: color.palette.white,
    borderColor: color.error,
    borderWidth: 1
  } as ViewStyle,

  /**
   * Outline error
   */
  outlinePlain: {
    ...BASE_VIEW,
    backgroundColor: color.palette.white,
    borderColor: color.textBlack,
    borderWidth: 1
  } as ViewStyle,

  /**
   * Ghost
   */
  ghost: {
    ...BASE_VIEW,
    backgroundColor: color.palette.white
  } as ViewStyle,

  /**
   * A button without extras.
   */
  link: {
    ...BASE_VIEW,
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: "flex-start",
    minHeight: 0
  } as ViewStyle,
}

export const textPresets: Record<ButtonPresetNames, TextStyle> = {
  primary: { 
    ...BASE_TEXT, 
    fontSize: fontSize.p, 
    color: color.palette.white 
  } as TextStyle,

  error: { 
    ...BASE_TEXT, 
    fontSize: fontSize.p, 
    color: color.palette.white 
  } as TextStyle,

  outline: { 
    ...BASE_TEXT, 
    fontSize: fontSize.p, 
    color: color.palette.green 
  } as TextStyle,

  outlineError: { 
    ...BASE_TEXT, 
    fontSize: fontSize.p, 
    color: color.error 
  } as TextStyle,

  outlinePlain: { 
    ...BASE_TEXT, 
    fontSize: fontSize.p, 
    color: color.textBlack 
  } as TextStyle,

  ghost: { 
    ...BASE_TEXT, 
    fontSize: fontSize.p, 
    color: color.palette.green 
  } as TextStyle,
  
  link: {
    ...BASE_TEXT,
    color: color.palette.green,
    paddingHorizontal: 0,
    paddingVertical: 0,
  } as TextStyle,
}

/**
 * A list of preset names.
 */
export type ButtonPresetNames = keyof typeof viewPresets
