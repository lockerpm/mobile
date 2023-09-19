import React, { useEffect } from 'react'
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import Dialog from 'react-native-ui-lib/dialog'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppEventType, EventBus } from 'app/utils/eventBus'
import { useTheme } from 'app/services/context'
import { Text } from '../text/Text'
import { Icon } from '../icon/Icon'
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated'
import { useKeyboard } from 'app/services/hook'

interface BottomModalProps {
  /**
   * Show modal
   */
  isOpen: boolean
  /**
   * Modal title
   */
  title: string
  onClose: () => void
  children?: React.ReactNode
  /**
   * Style for the outer content container useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Show modal view from bottom
 */
export const BottomModal = ({ style, children, isOpen, onClose, title }: BottomModalProps) => {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const keyboardHeight = useKeyboard()
  const $container: ViewStyle = {
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: insets.top + 16,
  }

  // Close on signal
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.CLOSE_ALL_MODALS, () => {
      onClose()
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  const keyboardAvoidingViewHeight = useDerivedValue(() => {
    return withTiming(keyboardHeight)
  }, [keyboardHeight])

  const $AvoidKeyboardStyle = useAnimatedStyle(() => ({
    height: 12 + keyboardAvoidingViewHeight.value,
    backgroundColor: colors.background,
  }))

  return (
    <Dialog
      supportedOrientations={['portrait', 'landscape']}
      containerStyle={[$container, style]}
      bottom
      width="100%"
      panDirection={null}
      visible={isOpen}
      onDialogDismissed={onClose}
      renderPannableHeader={() => (
        <View
          style={{
            height: 40,
            paddingHorizontal: 20,
            paddingTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            preset="bold"
            text={title}
            size="large"
            style={{
              maxWidth: '90%',
            }}
          />
          <Icon icon="x" onPress={onClose} />
        </View>
      )}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingHorizontal: 20 }}
      >
        {children}
        <Animated.View style={$AvoidKeyboardStyle} />
      </ScrollView>
    </Dialog>
  )
}
