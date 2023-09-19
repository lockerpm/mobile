import { useTheme } from 'app/services/context'
import * as React from 'react'
import { ComponentType } from 'react'
import {
  ColorValue,
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'

type RegularIconTypes = keyof typeof iconRegularRegistry
type CommonIconTypes = keyof typeof iconRegistry
export type IconTypes = RegularIconTypes | CommonIconTypes | null

export interface IconProps extends TouchableOpacityProps {
  /**
   * Filled style icon
   */
  filled?: boolean

  /**
   * The name of the icon
   * if null is given, the component will renders the view for placeholder
   */
  icon: IconTypes

  /**
   * An optional tint color for the icon
   */
  color?: ColorValue

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
export function Icon(props: IconProps) {
  const { colors } = useTheme()
  const {
    icon,
    color = colors.primaryText,
    filled,
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
          style={[
            $imageStyle,
            { tintColor: color },
            size && { width: size, height: size },
            $imageStyleOverride,
          ]}
          source={
            iconRegistry[icon]
              ? iconRegistry[icon]
              : !filled
              ? iconRegularRegistry[icon]
              : iconFillRegistry[icon]
          }
        />
      ) : (
        <View style={size && { width: size, height: size }} />
      )}
    </Wrapper>
  )
}

export const iconRegularRegistry = {
  'arrow-left': require('assets/icons/regular/arrow-left.png'),
  'arrow-right': require('assets/icons/regular/arrow-right.png'),
  'caret-left': require('assets/icons/regular/caret-left.png'),
  'caret-right': require('assets/icons/regular/caret-right.png'),
  check: require('assets/icons/regular/check.png'),
  'x-circle': require('assets/icons/regular/x-circle.png'),
  bug: require('assets/icons/regular/bug.png'),
  shield: require('assets/icons/regular/shield.png'),
  'shield-check': require('assets/icons/regular/shield-check.png'),
}

export const iconFillRegistry = {
  'arrow-left': require('assets/icons/fill/arrow-left-fill.png'),
  'arrow-right': require('assets/icons/fill/arrow-right-fill.png'),
  'caret-left': require('assets/icons/fill/caret-left-fill.png'),
  'caret-right': require('assets/icons/fill/caret-right-fill.png'),
  check: require('assets/icons/fill/check-fill.png'),
  'x-circle': require('assets/icons/fill/x-circle-fill.png'),
  bug: require('assets/icons/fill/bug-fill.png'),
  shield: require('assets/icons/fill/shield-fill.png'),
  'shield-check': require('assets/icons/fill/shield-check-fill.png'),
}

export const iconRegistry = {
  'eye-slash': require('assets/icons/eye-slash.png'),
  eye: require('assets/icons/eye.png'),
  dot: require('assets/icons/dot.png'),
  'magnifying-glass': require('assets/icons/magnifying-glass.png'),
  'envelope-simple': require('assets/icons/envelope-simple.png'),
  'device-mobile': require('assets/icons/device-mobile.png'),
  'face-id': require('assets/icons/face-id.png'),
  fingerprint: require('assets/icons/fingerprint.png'),
  info: require('assets/icons/info.png'),
  'check-circle': require('assets/icons/check-circle.png'),
  authenticator: require('assets/icons/authenticator.png'),
  browser: require('assets/icons/browser.png'),
  home: require('assets/icons/home.png'),
  menu: require('assets/icons/menu.png'),
  tools: require('assets/icons/tools.png'),
  'arrows-clockwise': require('assets/icons/arrows-clockwise.png'),
  'wifi-slash': require('assets/icons/wifi-slash.png'),
}

const $imageStyle: ImageStyle = {
  resizeMode: 'contain',
}
