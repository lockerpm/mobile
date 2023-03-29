import { observer } from 'mobx-react-lite'
import React, { ReactElement } from 'react'
import {
  ColorValue,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'
import { useMixins } from '../../../services/mixins'
import { spacing } from '../../../theme'
import { Icon, IconTypes } from '../icon/icon'
import { Text, TextProps } from '../text/text'

export interface HeaderProps {
  /**
   * The layout of the title relative to the action components.
   * - `center` will force the title to always be centered relative to the header. If the title or the action buttons are too long, the title will be cut off.
   * - `flex` will attempt to center the title relative to the action buttons. If the action buttons are different widths, the title will be off-center relative to the header.
   */
  titleMode?: 'center' | 'flex'
  /**
   * Optional title style override.
   */
  titleStyle?: StyleProp<TextStyle>
  /**
   * Optional outer title container style override.
   */
  titleContainerStyle?: StyleProp<ViewStyle>
  /**
   * Optional inner header wrapper style override.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Optional outer header container style override.
   */
  containerStyle?: StyleProp<ViewStyle>
  /**
   * Background color
   */
  backgroundColor?: string
  /**
   * Title text to display if not using `tx` or nested components.
   */
  title?: TextProps['text']
  /**
   * Icon that should appear on the left.
   * Can be used with `onLeftPress`.
   */
  leftIcon?: IconTypes
  /**
   * An optional tint color for the left icon
   */
  leftIconColor?: ColorValue
  /**
   * Left action text to display if not using `leftTx`.
   * Can be used with `onLeftPress`. Overrides `leftIcon`.
   */
  leftText?: TextProps['text']
  /**
   * Left text color defaukt is primary token (black)
   * An optional color for the left text
   */
  leftTextColor?: ColorValue
  /**
   * Left action custom ReactElement if the built in action props don't suffice.
   * Overrides `leftIcon`, `leftTx` and `leftText`.
   */
  LeftActionComponent?: ReactElement
  /**
   * What happens when you press the left icon or text action.
   */
  onLeftPress?: TouchableOpacityProps['onPress']
  /**
   * Icon that should appear on the right.
   * Can be used with `onRightPress`.
   */
  rightIcon?: IconTypes
  /**
   * An optional tint color for the right icon
   */
  rightIconColor?: ColorValue
  /**
   * Right action text to display if not using `rightTx`.
   * Can be used with `onRightPress`. Overrides `rightIcon`.
   */
  rightText?: TextProps['text']
  /**
   * Left text color defaukt is primary token (black)
   * An optional color for the right text
   */
  rightTextColor?: ColorValue
  /**
   * Right action custom ReactElement if the built in action props don't suffice.
   * Overrides `rightIcon`, `rightTx` and `rightText`.
   */
  RightActionComponent?: ReactElement
  /**
   * What happens when you press the right icon or text action.
   */
  onRightPress?: TouchableOpacityProps['onPress']

  /**
   * Custom middle view
   */
  children?: JSX.Element
  /**
   * Middle View style
   */
  childrenContainerStyle?: StyleProp<ViewStyle>
}

interface HeaderActionProps {
  backgroundColor?: string
  icon?: IconTypes
  iconColor?: ColorValue
  text?: TextProps['text']
  textColor?: ColorValue
  onPress?: TouchableOpacityProps['onPress']
  ActionComponent?: ReactElement
}

/**
 * Header that appears on many screens. Will hold navigation buttons and screen title.
 * The Header is meant to be used with the `screenOptions.header` option on navigators, routes, or screen components via `navigation.setOptions({ header })`.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-Header.md)
 */
export const Header = observer((props: HeaderProps) => {
  const { color: colors } = useMixins()
  const {
    backgroundColor = colors.transparent,
    LeftActionComponent,
    leftIcon,
    leftIconColor = colors.textBlack,
    leftText,
    leftTextColor,
    onLeftPress,
    onRightPress,
    RightActionComponent,
    rightIcon,
    rightIconColor = colors.textBlack,
    rightText,
    rightTextColor,
    title,
    titleMode = 'center',
    titleContainerStyle: $titleContainerStyleOverride,
    style: $styleOverride,
    titleStyle: $titleStyleOverride,
    containerStyle: $containerStyleOverride,
    children,
    childrenContainerStyle: $childrenContainerStyle,
  } = props

  const titleContent =  title

  return (
    <View style={[$container, { backgroundColor }, $containerStyleOverride]}>
      <View style={[$wrapper, $styleOverride]}>
        <HeaderAction
          text={leftText}
          textColor={leftTextColor}
          icon={leftIcon}
          iconColor={leftIconColor}
          onPress={onLeftPress}
          backgroundColor={backgroundColor}
          ActionComponent={LeftActionComponent}
        />

        {!!titleContent && (
          <View
            style={[
              titleMode === 'center' && $titleWrapperCenter,
              titleMode === 'flex' && $titleWrapperFlex,
              $titleContainerStyleOverride,
            ]}
            pointerEvents="none"
          >
            <Text
              size="medium"
              text={title}
              style={[$title, $titleStyleOverride]}
            />
          </View>
        )}

        {!!children && (
          <View style={[$childrenContainer, $childrenContainerStyle]}>{children}</View>
        )}

        <HeaderAction
          text={rightText}
          textColor={rightTextColor}
          icon={rightIcon}
          iconColor={rightIconColor}
          onPress={onRightPress}
          backgroundColor={backgroundColor}
          ActionComponent={RightActionComponent}
        />
      </View>
    </View>
  )
})

function HeaderAction(props: HeaderActionProps) {
  const {
    backgroundColor,
    icon,
    text,
    textColor,
    onPress,
    ActionComponent,
    iconColor,
  } = props

  const content =  text

  if (ActionComponent) return ActionComponent

  if (content) {
    return (
      <TouchableOpacity
        style={[$actionTextContainer, { backgroundColor }]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.8}
      >
        <Text
          color={textColor}
          size="medium"
          text={text}
        />
      </TouchableOpacity>
    )
  }

  if (icon) {
    return (
      <Icon
        size={20}
        icon={icon}
        color={iconColor}
        onPress={onPress}
        containerStyle={[$actionIconContainer, { backgroundColor }]}
      />
    )
  }

  return <View style={[$actionFillerContainer, { backgroundColor }]} />
}

const $wrapper: ViewStyle = {
  height: 56,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const $container: ViewStyle = {
  width: '100%',
}

const $childrenContainer: ViewStyle = {
  flex: 1,
  width: '100%',
  height: '100%',
}

const $title: TextStyle = {
  textAlign: 'center',
}

const $actionTextContainer: ViewStyle = {
  flexGrow: 0,
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  paddingHorizontal: spacing.medium,
  zIndex: 2,
}

const $actionIconContainer: ViewStyle = {
  flexGrow: 0,
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  paddingHorizontal: spacing.medium,
  zIndex: 2,
}

const $actionFillerContainer: ViewStyle = {
  width: 16,
}

const $titleWrapperCenter: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  position: 'absolute',
  paddingHorizontal: spacing.medium,
  zIndex: 1,
}

const $titleWrapperFlex: ViewStyle = {
  justifyContent: 'center',
  flexGrow: 1,
}
