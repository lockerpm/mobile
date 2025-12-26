import { StyleProp, ViewStyle, Modal, View, StyleSheet, Platform } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { debounce } from "@/utils/utils"

import { BottomModalHeader } from "./BottomModalHeader"
import { TextProps } from "../text/Text"

interface Props {
  /**
   * Show modal
   */
  isOpen: boolean
  /**
   * Modal title
   */
  tx?: TextProps["tx"]

  onClose: () => void
  children?: React.ReactNode
  /**
   * Style for the outer content container useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Style for the outer content container useful for padding & margin.
   */
  contentContainer?: StyleProp<ViewStyle>
  onDismiss?: () => void
}

/**
 * Show modal view from bottom
 * This modal is used to show content from bottom of the screen
 * Dont use this modal for showing forms or inputs
 */
export const BottomModal = ({
  style,
  children,
  isOpen,
  onClose,
  tx,
  contentContainer,
  onDismiss,
}: Props) => {
  const { themed } = useAppTheme()
  const insets = useSafeAreaInsets()

  return (
    <Modal
      transparent
      animationType="fade"
      supportedOrientations={["portrait", "landscape"]}
      style={[styles.container, style]}
      visible={isOpen}
      onDismiss={onDismiss}
    >
      <View style={themed($backdrop)} onTouchStart={debounce(onClose, 250)} />
      <Animated.View
        entering={Platform.OS === "ios" ? FadeInDown : undefined}
        style={themed($contentBackground)}
      >
        <BottomModalHeader tx={tx} onClose={onClose} />
        <View style={[$contentContainer, contentContainer, { paddingBottom: insets.bottom }]}>
          {children}
        </View>
      </Animated.View>
    </Modal>
  )
}

const $contentBackground: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  marginTop: -12,
  overflow: "hidden",
})

const $backdrop: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.transparentModal,
})

const $contentContainer: StyleProp<ViewStyle> = {
  paddingHorizontal: 16,
  maxHeight: "80%",
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
})
