import { Platform } from "react-native"
import { isTablet } from "react-native-device-info"
/**
 * You can find a list of available fonts on both iOS and Android here:
 * https://github.com/react-native-training/react-native-fonts
 *
 * If you're interested in adding a custom font to your project,
 * check out the readme file in ./assets/fonts/ then come back here
 * and enter your new font name. Remember the Android font name
 * is probably different than iOS.
 * More on that here:
 * https://github.com/lendup/react-native-cross-platform-text
 *
 * The various styles of fonts are defined in the <Text /> component.
 */
export const typography = {
  /**
   * The primary font.  Used in most places.
   */
  primary: Platform.select({ ios: "System", android: "System" }),

  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: "System", android: "System" }),

  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: "Courier", android: "monospace" }),
}

export const fontSizes = {
  '5xl': 48,
  '4xl': 32,
  '3xl': 28,
  '2xl': 24,
  'xl': 20,
  large: 18,
  medium: 16,
  base: 14,
  small: 12,
  'sx': 10,
}


const fontSizeNormal = {
  h1: 26 ,
  h2: 24 ,
  h3: 22 ,
  h4: 20 ,
  h5: 18 ,
  p: 16 ,
  small: 14 ,
  mini: 10 
}


const fontSizeTablet = {
  h1: 28 ,
  h2: 26 ,
  h3: 24 ,
  h4: 22 ,
  h5: 20 ,
  p: 18 ,
  small: 16 ,
  mini: 12 
}
export const fontSize = isTablet() ? fontSizeTablet : fontSizeNormal