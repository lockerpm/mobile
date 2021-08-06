import { color } from "./color";
import { typography } from "./typography";

export const nativebaseTheme = {
  fonts: {
    header: typography.primary,
    body: typography.primary,
    mono: typography.code
  },
  colors: {
    csGreen: {
      50: '#e4fbe8',
      100: '#c1efc8',
      200: '#9be2a6',
      300: color.palette.green,
      400: color.palette.green,
      500: color.palette.green,
      600: '#288a37',
      700: '#1b6326',
      800: '#0c3b16',
      900: '#001601',
    }
  },
  components: {
    Toast: {
      baseStyle: {
        _closeIcon: {
          size: 3,
        },
      }
    },
    Input: {
      baseStyle: {
        _focus: {
          borderColor: 'csGreen.400'
        },
        _android: {
          _focus: {
            borderColor: 'csGreen.400',
          },
        },
        _ios: {
          _focus: {
            borderColor: 'csGreen.400',
          },
        },
      },
      defaultProps: {
        size: 'sm'
      }
    }
  }
}