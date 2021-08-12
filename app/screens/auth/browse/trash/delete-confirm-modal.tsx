import React from "react"
import { Modal } from "native-base"
import { Button, Text, AutoImage as Image } from "../../../../components"
import { color } from "../../../../theme"

interface Props {
  isOpen?: boolean,
  onClose?: Function,
  deleteItem?: Function
}

export const DeleteConfirmModal = (props: Props) => {
  const { isOpen, onClose, deleteItem } = props
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Body style={{ alignItems: 'center' }}>
          <Image
            source={require('./trash.png')}
            style={{ height: 110 }}
          />
          <Text
            preset="black"
						text="Delete item?"
						style={{ fontSize: 18, marginBottom: 5, marginTop: 15 }}
          />
					<Text
						text="This item will be lost and you will no longer be able to restore it."
						style={{ textAlign: 'center', fontSize: 12 }}
					/>
        </Modal.Body>
        <Modal.Footer style={{ marginRight: 20, marginBottom: 16, paddingRight: 0 }}>
          <Button
            isNativeBase
						colorScheme="csError"
            onPress={() => deleteItem && deleteItem()}
            style={{
              width: '100%'
            }}
          >
						<Text
							text="Delete"
							style={{ color: color.palette.white }}
						/>
					</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
}