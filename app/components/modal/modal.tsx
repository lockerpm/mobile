import React, { useEffect } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { flatten } from "ramda"
import Dialog from "react-native-ui-lib/dialog"
import { commonStyles, fontSize } from "../../theme"
import { Text } from "../text/text"
import { Button } from "../button/button"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { useMixins } from "../../services/mixins"


export interface ModalProps {
  style?: StyleProp<ViewStyle>
  isOpen?: boolean
  children?: React.ReactNode
  onClose?: () => void
  onOpen?: () => void
  title?: string
  ignoreBackgroundPress?: boolean
}

/**
 * Describe your component here
 */
export const Modal = function Modal(props: ModalProps) {
  const { style, isOpen, children, onClose, onOpen, title, ignoreBackgroundPress } = props
  const { color } = useMixins()

  const CONTAINER: ViewStyle = {
    justifyContent: "center",
    backgroundColor: color.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderRadius: 5
  }
  const styles = flatten([CONTAINER, style])

  useEffect(() => {
    if (isOpen) {
      onOpen && onOpen()
    }
  }, [isOpen])

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
      <View 
        style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: 10
        }]}
      >
        <Text
          preset="header"
          text={title}
          numberOfLines={2}
          style={{
            fontSize: fontSize.h4
          }}
        />

        <Button
          preset="link"
          onPress={onClose}
        >
          <IoniconsIcon
            name="close"
            size={22}
            color={color.text}
          />
        </Button>
      </View>
      {children}
    </Dialog>
  )
}
