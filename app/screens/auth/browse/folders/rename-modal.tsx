import React, { useState } from "react"
import { Modal } from "native-base"
import { FloatingInput, Button, Text } from "../../../../components"

interface Props {
  isOpen?: boolean,
  onClose?: Function,
  renameFolder?: Function
}

export const RenameModal = (props: Props) => {
  const { isOpen, onClose, renameFolder } = props
  const [name, setName] = useState('')
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>
          <Text
            preset="header"
            style={{
              fontSize: 18
            }}
          >
            Rename Folder
          </Text>
        </Modal.Header>
        <Modal.Body>
          <FloatingInput
            label="Name"
            value={name}
            onChangeText={txt => setName(txt)}
          />
        </Modal.Body>
        <Modal.Footer style={{ marginRight: 20, marginBottom: 16, paddingRight: 0 }}>
          <Button
            isNativeBase
            text="Save"
            onPress={() => renameFolder && renameFolder()}
            style={{
              width: '100%'
            }}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
}