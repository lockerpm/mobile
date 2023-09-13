import { Platform } from 'react-native'
import { isTablet } from 'react-native-device-info'

const fonts = {
  inter: {
    // Cross-platform Google font.
    regular: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter-Regular',
    }),
    medium: Platform.select({
      ios: 'Inter-Medium',
      android: 'Inter-Medium',
    }),
    semibold: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter-SemiBold',
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
  secondary: Platform.select({ ios: 'System', android: 'System' }),

  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: 'Courier', android: 'monospace' }),
}

export const fontSizes = {
  '5xl': 48,
  '4xl': 32,
  '3xl': 28,
  '2xl': 24,
  xl: 20,
  large: 18,
  medium: 16,
  base: 14,
  small: 12,
  sx: 10,
}

const fontSizeNormal = {
  h1: 26,
  h2: 24,
  h3: 22,
  h4: 20,
  h5: 18,
  p: 16,
  small: 14,
  mini: 10,
}

const fontSizeTablet = {
  h1: 28,
  h2: 26,
  h3: 24,
  h4: 22,
  h5: 20,
  p: 18,
  small: 16,
  mini: 12,
}
export const fontSize = isTablet() ? fontSizeTablet : fontSizeNormal
