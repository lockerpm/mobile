import * as React from "react"
import { ComponentType } from "react"
import {
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native"

export  type IconTypes = keyof typeof imgIconRegistry

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
export function ImageIcon(props: IconProps) {
  const {
    icon,
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
          // color && { tintColor: color },
          size && { width: size, height: size },
          $imageStyleOverride,
        ]}
        source={imgIconRegistry[icon]}
      />
    </Wrapper>
  )
}

/**
 * Colorful image icon
 */
export const imgIconRegistry = {
  'app-logo-secondary': require('../../../../assets/icon/app-logo-secondary.png'),
  'security-key': require('../../../../assets/icon/security-key.png'),
  keychain: require('../../../../assets/icon/keychain.png'),
  desktop: require('../../../../assets/icon/desktop.png'),
  identification: require('../../../../assets/icon/identification.png'),
  mobile: require('../../../../assets/icon/mobile.png'),
  password: require('../../../../assets/icon/password.png'),
  wallet: require('../../../../assets/icon/wallet.png'),
  wand: require('../../../../assets/icon/wand.png'),
  'app-logo': require('../../../../assets/icon/app-logo.png'),
  avatar: require('../../../../assets/icon/avatar.png'),
  'key-hole': require('../../../../assets/icon/key-hole.png'),
  'number-square-one': require('../../../../assets/icon/number-square-one.png'),
}

const $imageStyle: ImageStyle = {
  resizeMode: "contain",
}