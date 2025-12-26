import { View, Modal, StyleSheet, ViewStyle, Platform } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import { Text, PressableScale, ModalBackdrop, TextProps } from "app/components/cores"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  /**
   * Action sheet close text.
   */
  closeText?: TextProps["text"]
  /**
   * Action sheet close tx.
   */
  closeTx?: TextProps["tx"]
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
  children?: React.ReactNode[] | React.ReactNode
  /**
   * show cancel button.
   */
  isDisableCancelButton?: boolean

  header?: React.ReactNode
  footer?: React.ReactNode
}

const IS_IOS = Platform.OS === "ios"

/**
 * is a surface containing content related to the previous screen.
 */
export const NewActionSheet = ({
  closeText,
  closeTx,
  isOpen,
  onClose,
  children,
  isDisableCancelButton,
  footer,
  header,
}: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const insets = useSafeAreaInsets()

  const isArray = Array.isArray(children)

  const $border = {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  }
  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="fade"
      visible={isOpen}
      onDismiss={onClose}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
        <ModalBackdrop onPress={onClose} backgroundColor={colors.transparentModal} />

        <Animated.View entering={IS_IOS ? FadeInDown : undefined} style={themed($content)}>
          {header}
          {isArray &&
            children.map((child, index) => (
              <View key={index} style={index > 0 ? $border : undefined}>
                {child}
              </View>
            ))}
          {!isArray && children}
          {footer}
        </Animated.View>

        {!isDisableCancelButton && (
          <PressableScale onPress={onClose}>
            <Animated.View
              entering={IS_IOS ? FadeInDown.delay(120) : undefined}
              style={themed($cancel)}
            >
              <Text weight="semiBold" text={closeText} tx={closeTx ?? "common:cancel"} />
            </Animated.View>
          </PressableScale>
        )}
      </View>
    </Modal>
  )
}

const $cancel: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignItems: "center",
  borderRadius: 12,
  justifyContent: "center",
  marginHorizontal: 16,
  marginTop: 16,
  padding: 16,
  backgroundColor: colors.background,
})

const $content: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  marginHorizontal: 16,
  overflow: "hidden",
  backgroundColor: colors.background,
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 8,
  },
})
