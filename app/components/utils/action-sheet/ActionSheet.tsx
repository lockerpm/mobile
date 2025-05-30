import React, { ComponentType, ReactElement } from "react"
import {
  ColorValue,
  StyleProp,
  TextStyle,
  TouchableHighlight,
  TouchableHighlightProps,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native"
import Modal from "react-native-modal"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { Text, Icon, IconTypes, PressableScale, ModalBackdrop } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"

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
  footer?: ReactElement
}

/**
 * is a surface containing content related to the previous screen.
 */
export const NewActionSheet = (props: Props) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()
  const {
    closeText = translate("common.cancel"),
    isOpen,
    onClose,
    children,
    isDisableCancelButton,
    footer,
  } = props
  const safeAreaEdges = useSafeAreaInsetsStyle(["bottom"])
  const $containerStyle: StyleProp<ViewStyle> = [
    { margin: 16, justifyContent: "flex-end" },
    safeAreaEdges,
  ]

  const isArray = Array.isArray(children)

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      isVisible={isOpen}
      onModalHide={onClose}
      avoidKeyboard
      style={$containerStyle}
      customBackdrop={<ModalBackdrop onPress={onClose} />}
    >
      <View style={{ borderRadius: 12, overflow: "hidden", backgroundColor: colors.background }}>
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
        {footer}
      </View>

      {!isDisableCancelButton && (
        <PressableScale onPress={onClose}>
          <View
            style={{
              marginTop: 16,
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text weight="semibold" text={closeText} color={colors.primaryText} />
          </View>
        </PressableScale>
      )}
    </Modal>
  )
}

interface ItemProps extends TouchableHighlightProps {
  isCheck?: boolean
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

export const NewActionSheetItem = (props: ItemProps) => {
  const { colors } = useTheme()
  const {
    icon,
    LeftIcon,
    text,
    iconColor = colors.primaryText,
    color = colors.primaryText,
    children,
    ...touchableProps
  } = props

  const $containerStyle: StyleProp<ViewStyle> = [
    { padding: 16, opacity: touchableProps?.disabled ? 0.5 : 1 },
    { justifyContent: "center" },
  ]

  return (
    <TouchableHighlight {...touchableProps} underlayColor={colors.disable}>
      {children || (
        <View style={{ backgroundColor: colors.background }}>
          <View style={$containerStyle}>
            {!!LeftIcon && <LeftIcon color={iconColor || color} style={{ marginRight: 16 }} />}
            <Text text={text} color={color} style={{ flexGrow: 1 }} />
            {!!icon && (
              <Icon
                icon={icon}
                color={iconColor || color}
                containerStyle={{ position: "absolute", right: 16 }}
              />
            )}
          </View>
        </View>
      )}
    </TouchableHighlight>
  )
}
