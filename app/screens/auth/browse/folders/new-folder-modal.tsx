import React, { useState } from "react"
import { Modal } from "native-base"
import { FloatingInput, Button, Text } from "../../../../components"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import { FolderView } from "../../../../../core/models/view/folderView"
import { useCoreService } from "../../../../services/core-service"
import { FolderRequest } from "../../../../../core/models/request/folderRequest"
import { useMixins } from "../../../../services/mixins"

interface Props {
  isOpen?: boolean,
  onClose?: Function
}

export const NewFolderModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { folderStore } = useStores()
  const { folderService } = useCoreService()
  const { notify } = useMixins()

  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateFolder = async () => {
    setIsLoading(true)
    const data = new FolderView()
    data.name = name
    const folderEnc = await folderService.encrypt(data)
    const payload = new FolderRequest(folderEnc)
    const res = await folderStore.createFolder(payload)
    if (res.kind === 'ok') {
      notify('success', '', 'Folder created')
      onClose()
    } else {
      notify('error', '', 'Something went wrong')
    }
    setIsLoading(false)
  }
  
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
            Create New Folder
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
            text="Create"
            disabled={isLoading || !name.trim()}
            isLoading={isLoading}
            onPress={handleCreateFolder}
            style={{
              width: '100%'
            }}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
})
