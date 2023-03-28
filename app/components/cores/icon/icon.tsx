import * as React from "react"
import { ComponentType } from "react"
import {
  ColorValue,
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native"

export type IconTypes = keyof typeof iconRegistry

interface IconProps extends TouchableOpacityProps {
  /**
   * The name of the icon
   */
  icon: IconTypes

  /**
   * An optional size for the icon. If not provided, the icon will be sized to the icon's resolution.
   */
  size?: number

  /**
   * An option tint color for the icon 
   */
  color?: ColorValue

  /**
   * Style overrides for the icon image
   */
  style?: StyleProp<ImageStyle>

  /**
   * Style overrides for the icon container
   */
  containerStyle?: StyleProp<ViewStyle>

  /**
   * An optional function to be called when the icon is pressed
   */
  onPress?: TouchableOpacityProps["onPress"]
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity /> if `onPress` is provided, otherwise a <View />.
 */
export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...WrapperProps
  } = props

  const isPressable = !!WrapperProps.onPress
  const Wrapper: ComponentType<TouchableOpacityProps> = WrapperProps?.onPress
    ? TouchableOpacity
    : View

  return (
    <Wrapper
      accessibilityRole={isPressable ? "imagebutton" : undefined}
      {...WrapperProps}
      style={$containerStyleOverride}
    >
      <Image
        style={[
          $imageStyle,
          color && { tintColor: color },
          size && { width: size, height: size },
          $imageStyleOverride,
        ]}
        source={iconRegistry[icon]}
      />
    </Wrapper>
  )
}

export const iconRegistry = {
  'caret-left': require('../../../../assets/icon/arrow/CaretLeft.png'),
  'arrow-left': require('../../../../assets/icon/arrow/ArrowLeft.png'),
  'eye': require('../../../../assets/icon/common/eye.png'),
  'eye-slash': require('../../../../assets/icon/common/eye-slash.png'),
  'user': require('../../../../assets/icon/common/user.png'),
  'buildings': require('../../../../assets/icon/common/buildings.png'),
  'briefcaseMetal': require('../../../../assets/icon/common/briefcaseMetal.png'),
  'trash':  require('../../../../assets/icon/common/trash.png'),
  'checkbox-check':  require('../../../../assets/icon/common/checkbox-check.png'),
  'checkbox':  require('../../../../assets/icon/common/checkbox.png'),
  'check':  require('../../../../assets/icon/common/check.png'),
  'global':  require('../../../../assets/icon/common/global.png'),
}

const $imageStyle: ImageStyle = {
  resizeMode: "contain",
}