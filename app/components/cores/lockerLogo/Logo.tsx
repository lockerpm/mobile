import * as React from 'react'
import { ComponentType } from 'react'
import {
  Image,
  ImageResizeMode,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'

type LogoPreset = keyof typeof logoRegistry

interface LogoProps extends TouchableOpacityProps {
  /**
   * The name of the Logo
   * if null is given, the component will renders the view for placeholder
   */
  preset: LogoPreset

  /**
   * Style overrides for the Logo image
   */
  style?: StyleProp<ImageStyle>

  /**
   * Style overrides for the Logo container
   */
  containerStyle?: StyleProp<ViewStyle>

  resizeMode?: ImageResizeMode
  /**
   * An optional function to be called when the Logo is pressed
   */
  onPress?: TouchableOpacityProps['onPress']
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity /> if `onPress` is provided, otherwise a <View />.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-Icon.md)
 */
export function Logo(props: LogoProps) {
  const {
    preset,
    containerStyle: $containerStyleOverride,
    resizeMode = 'contain',
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
      <Image style={props.style} source={logoRegistry[preset]} resizeMode={resizeMode} />
    </Wrapper>
  )
}

const logoRegistry = {
  default: require('assets/images/logo/locker.png'),
  'app-logo-secondary': require('assets/images/icons/app-logo-secondary.png'),
  'vertical-dark': require('assets/images/logo/logo-vertical-dark.png'),
  'vertical-light': require('assets/images/logo/logo-vertical-light.png'),
  'locker-bg-dark': require('assets/images/logo/locker-dark.png'),
  'horizontal-dark': require('assets/images/logo/logo-horizontal-dark.png'),
  'horizontal-light': require('assets/images/logo/logo-horizontal-light.png'),
}
