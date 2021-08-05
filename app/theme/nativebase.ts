import { color } from "./color";
import { typography } from "./typography";

export const nativebaseTheme = {
  fonts: {
    header: typography.primary,
    body: typography.primary,
    mono: typography.code
  },
  colors: {
    darkText: {
      400: color.text,
      600: color.title,
      700: color.title
    }
  },
  // components: {
  //   Button: {
  //     baseStyle: {},
  //     defaultProps: {},
  //     variants: {
  //       rounded: {

  //       }
  //     }
  //   }
  // }
}