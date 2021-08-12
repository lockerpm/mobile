import { StyleProp, TextStyle, TouchableOpacityProps, ViewStyle } from "react-native"
import { ButtonPresetNames } from "./button.presets"
import { TxKeyPath } from "../../i18n"
import { ResponsiveValue } from "native-base/lib/typescript/components/types"

export interface ButtonProps extends TouchableOpacityProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath

  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string

  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  /**
   * An optional style override useful for the button text.
   */
  textStyle?: StyleProp<TextStyle>

  /**
   * One of the different types of text presets.
   */
  preset?: ButtonPresetNames

  /**
   * One of the different types of text presets.
   */
  children?: React.ReactNode,

  // Native base button
  isNativeBase?: boolean,
  colorScheme?: string,
  variant?: ResponsiveValue<"solid" | "outline" | "ghost" | "link" | "unstyled">,
  isLoading?: boolean ,
  startIcon?: JSX.Element | JSX.Element[],
  endIcon?: JSX.Element | JSX.Element[],
  isDisabled?: boolean
}
