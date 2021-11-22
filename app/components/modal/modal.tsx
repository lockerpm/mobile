import React, { useEffect } from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"
import Dialog from "react-native-ui-lib/dialog"
import { commonStyles, fontSize, color as colorLight, colorDark } from "../../theme"
import { Text } from "../text/text"
import { Button } from "../button/button"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { useStores } from "../../models"


export interface ModalProps {
  style?: StyleProp<ViewStyle>
  isOpen?: boolean
  children?: React.ReactNode
  onClose?: () => void
  onOpen?: () => void
  title?: string
}

/**
 * Describe your component here
 */
export const Modal = observer(function Modal(props: ModalProps) {
  const { style, isOpen, children, onClose, onOpen, title } = props
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

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
})
