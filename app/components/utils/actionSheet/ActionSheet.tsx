import React from "react"
import { View, Modal, StyleSheet } from "react-native"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { Text, PressableScale, ModalBackdrop } from "app/components/cores"
import { useTheme } from "app/services/context"
import Animated, { FadeInDown } from "react-native-reanimated"

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
  children?: React.ReactNode[] | React.ReactNode
  /**
   * show cancel button.
   */
  isDisableCancelButton?: boolean

  header?: React.ReactNode
  footer?: React.ReactNode
}

const backdropColor = "rgba(0, 0, 0, 0.5)"
/**
 * is a surface containing content related to the previous screen.
 */
export const NewActionSheet = (props: Props) => {
  const { colors } = useTheme()
  const { closeText, isOpen, onClose, children, isDisableCancelButton, footer, header } = props
  const safeAreaEdges = useSafeAreaInsetsStyle(["bottom"])

  const isArray = Array.isArray(children)

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      visible={isOpen}
      onDismiss={onClose}
    >
      <View style={[safeAreaEdges, styles.container]}>
        <ModalBackdrop onPress={onClose} backgroundColor={backdropColor} />

        <Animated.View
          entering={FadeInDown}
          style={[styles.content, { backgroundColor: colors.background }]}
        >
          {header}
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
        </Animated.View>

        {!isDisableCancelButton && (
          <PressableScale onPress={onClose}>
            <Animated.View
              entering={FadeInDown.delay(120)}
              style={[
                styles.cancel,
                {
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Text weight="semibold" text={closeText} tx="common.cancel" />
            </Animated.View>
          </PressableScale>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  cancel: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  content: {
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: "hidden",
  },
})
