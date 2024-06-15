import React, { ComponentType, ReactElement } from 'react'
import {
  ColorValue,
  StyleProp,
  TextStyle,
  TouchableHighlight,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native'
import Modal from 'react-native-modal'
import { useSafeAreaInsetsStyle } from 'app/utils/useSafeAreaInsetsStyle'
import { useTheme } from 'app/services/context/useTheme'
import { useHelper } from 'app/services/hook'
import { IconTypes, Text, Icon } from 'app/components/cores'

interface Props {
  /**
   * Bottom sheet title header
   */
  closeText?: string
  /**
   * Set Bottom sheet is visable
   */
  isOpen: boolean
  /**
   * Call back when bottom sheet Dismissed
   */
  onClose: () => void
  /**
   * Children components.
   */
  children?: ReactElement[] | ReactElement
  /**
   * show cancel button.
   */
  isDisableCancelButton?: boolean
}

/**
 * is a surface containing content related to the previous screen.
 */
export const aActionSheet = (props: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()
  const {
    closeText = translate('common.cancel'),
    isOpen,
    onClose,
    children,
    isDisableCancelButton,
  } = props
  const safeAreaEdges = useSafeAreaInsetsStyle(['bottom'])
  const $containerStyle: StyleProp<ViewStyle> = [
    { margin: 16, justifyContent: 'flex-end' },
    safeAreaEdges,
  ]

  const isArray = Array.isArray(children)

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      isVisible={isOpen}
      onModalHide={onClose}
      style={$containerStyle}
    // customBackdrop={
    //   <TouchableWithoutFeedback
    //     style={{ flex: 1, backgroundColor: 'red', height: '100%', width: '100%' }}
    //     onPress={onClose}
    //   />
    // }
    >
      <View style={{ borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
        {isArray &&
          children.map((child, index) => (
            <View
              key={index}
              style={{
                borderTopColor: colors.border,
                borderTopWidth: index === 0 ? 0 : 1,
              }}
            >
              {child}
            </View>
          ))}
        {!isArray && children}
      </View>

      {!isDisableCancelButton && (
        <TouchableHighlight
          underlayColor={colors.border}
          onPress={onClose}
          style={{
            backgroundColor: colors.block,
            borderRadius: 12,
            padding: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text text={closeText} color={colors.secondaryText} />
        </TouchableHighlight>
      )}
    </Modal>
  )
}

interface ItemProps extends TouchableHighlightProps {
  /**
   * The icon to display
   */
  icon?: IconTypes
  /**
   * An optional component to render on the left side icon of the item.
   */
  LeftIcon?: ComponentType<{ style: StyleProp<any>; color: ColorValue }>

  /**
   * The text to display
   */
  text: string
  /**
   * The color of text, icon to display
   */
  color?: ColorValue
  /**
   * The color of icon, icon to display
   */
  iconColor?: ColorValue
  /**
   * An optional style override for the item text.
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * Children components.
   */
  children?: ReactElement[] | ReactElement
}

export const ActionSheetItem = (props: ItemProps) => {
  const { colors } = useTheme()
  const {
    icon,
    LeftIcon,
    text,
    textStyle,
    iconColor = colors.secondaryText,
    color = colors.link,
    children,
    ...touchableProps
  } = props

  const $containerStyle: StyleProp<ViewStyle> = [
    { padding: 16, opacity: touchableProps?.disabled ? 0.5 : 1 },
    !icon && !LeftIcon
      ? { justifyContent: 'center', alignItems: 'center' }
      : { flexDirection: 'row', alignItems: 'center' },
  ]

  return (
    <TouchableHighlight {...touchableProps} underlayColor={colors.disable}>
      {children || (
        <View style={{ backgroundColor: colors.block }}>
          <View style={$containerStyle}>
            {!!icon && <Icon icon={icon} color={iconColor || color} style={{ marginRight: 16 }} />}
            {!!LeftIcon && <LeftIcon color={iconColor || color} style={{ marginRight: 16 }} />}
            <Text text={text} style={textStyle} color={color} />
          </View>
        </View>
      )}
    </TouchableHighlight>
  )
}
