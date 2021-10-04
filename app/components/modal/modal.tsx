import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"
import Dialog from "react-native-ui-lib/dialog"
import { commonStyles, fontSize, color } from "../../theme"
import { Text } from "../text/text"
import { Button } from "../button/button"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'


const CONTAINER: ViewStyle = {
  justifyContent: "center",
  backgroundColor: color.palette.white,
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 30,
  borderRadius: 5
}

export interface ModalProps {
  style?: StyleProp<ViewStyle>
  isOpen?: boolean
  children?: React.ReactNode
  onClose?: () => void
  title?: string
}

/**
 * Describe your component here
 */
export const Modal = observer(function Modal(props: ModalProps) {
  const { style, isOpen, children, onClose, title } = props
  const styles = flatten([CONTAINER, style])

  return (
    <Dialog
      containerStyle={styles}
      useSafeArea
      panDirection={null}
      visible={isOpen}
      // onDismiss={onClose}
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
