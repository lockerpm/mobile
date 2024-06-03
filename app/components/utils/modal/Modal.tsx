import React, { useEffect } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import Dialog from "react-native-ui-lib/dialog"
import { Text, Icon } from "../../cores"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { useTheme } from "app/services/context"


export interface ModalProps {
  style?: StyleProp<ViewStyle>
  isOpen?: boolean
  children?: React.ReactNode
  onClose?: () => void
  onOpen?: () => void
  title?: string
  ignoreBackgroundPress?: boolean
  disableHeader?: boolean   // remove close button 
}

/**
 * Describe your component here
 */
export const Modal = (props: ModalProps) => {
  const { style, isOpen, children, onClose, onOpen, title, ignoreBackgroundPress, disableHeader } = props
  const { colors } = useTheme()

  const CONTAINER: ViewStyle = {
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderRadius: 5
  }
  const styles: StyleProp<ViewStyle> = [CONTAINER, style]

  useEffect(() => {
    if (isOpen) {
      onOpen && onOpen()
    }
  }, [isOpen])

  // Close on signal
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.CLOSE_ALL_MODALS, () => {
      onClose()
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  return (
    <Dialog
      containerStyle={styles}
      useSafeArea
      panDirection={null}
      visible={isOpen}
      onDialogDismissed={onClose}
      supportedOrientations={['portrait', 'landscape']}
      ignoreBackgroundPress={ignoreBackgroundPress}
    >
      {
        !disableHeader && <View
          style={{
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Text
            preset="bold"
            text={title}
            numberOfLines={2}
            size="xl"
          />
          <Icon
            icon="x-circle"
            size={24}
            onPress={onClose}
          />
        </View>
      }
      {children}
    </Dialog>
  )
}
