import * as React from 'react'
import { ComponentType } from 'react'
import {
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'

export type ImageIconTypes = keyof typeof imageRegistry

interface IconProps extends TouchableOpacityProps {
  /**
   * The name of the icon
   * if null is given, the component will renders the view for placeholder
   */
  icon: ImageIconTypes

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
  onPress?: TouchableOpacityProps['onPress']
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity /> if `onPress` is provided, otherwise a <View />.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-Icon.md)
 */
export function ImageIcon(props: IconProps) {
  const {
    icon,
    size = 24,
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
      accessibilityRole={isPressable ? 'imagebutton' : undefined}
      {...WrapperProps}
      style={$containerStyleOverride}
    >
      {icon ? (
        <Image
          style={[$imageStyle, size && { width: size, height: size }, $imageStyleOverride]}
          source={imageRegistry[icon]}
        />
      ) : (
        <View style={size && { width: size, height: size }} />
      )}
    </Wrapper>
  )
}

export const imageRegistry = {
  apple: require('assets/images/icons/apple.png'),
  facebook: require('assets/images/icons/facebook.png'),
  github: require('assets/images/icons/github.png'),
  google: require('assets/images/icons/google.png'),
  sso: require('assets/images/icons/sso.png'),
  'security-key': require('assets/images/icons/security-key.png'),
  keychain: require('assets/images/icons/keychain.png'),
  desktop: require('assets/images/icons/desktop.png'),
  identification: require('assets/images/icons/identification.png'),
  mobile: require('assets/images/icons/mobile.png'),
  password: require('assets/images/icons/password.png'),
  wallet: require('assets/images/icons/wallet.png'),
  wand: require('assets/images/icons/wand.png'),
  'app-logo': require('assets/images/icons/app-logo.png'),
  avatar: require('assets/images/icons/avatar.png'),
  'key-hole': require('assets/images/icons/key-hole.png'),
  'number-square-one': require('assets/images/icons/number-square-one.png'),
  'root-email': require('assets/images/icons/root-email.png'),
  'password-generator': require('assets/images/icons/tools/password-generator.png'),
  authenticator: require('assets/images/icons/tools/authenticator.png'),
  'password-health': require('assets/images/icons/tools/password-health.png'),
  'data-breach-scanner': require('assets/images/icons/tools/data-breach-scanner.png'),
  emergency: require('assets/images/icons/appNoti/emergency.png'),
  marketing: require('assets/images/icons/appNoti/marketing.png'),
  'pw-tips': require('assets/images/icons/appNoti/pw-tips.png'),
  'share-item': require('assets/images/icons/appNoti/share-item.png'),

  folder: require('assets/images/icons/folder/folder.png'),
  'folder-add': require('assets/images/icons/folder/folder-add.png'),
  'folder-share': require('assets/images/icons/folder/folder-share.png'),
}

const $imageStyle: ImageStyle = {
  resizeMode: 'contain',
}
