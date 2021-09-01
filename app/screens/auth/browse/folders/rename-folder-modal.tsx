import React, { useState, useEffect } from "react"
import { Modal } from "native-base"
import { FloatingInput, Button, Text } from "../../../../components"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { useCoreService } from "../../../../services/core-service"
import { FolderView } from "../../../../../core/models/view/folderView"
import { FolderRequest } from "../../../../../core/models/request/folderRequest"
import { useMixins } from "../../../../services/mixins"
import { CollectionView } from "../../../../../core/models/view/collectionView"

interface Props {
  isOpen?: boolean,
  onClose?: Function,
  folder: FolderView | CollectionView
}

export const RenameFolderModal = observer((props: Props) => {
  const { isOpen, onClose, folder } = props
  const { folderStore } = useStores()
  const { folderService } = useCoreService()
  const { notify } = useMixins()

  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const renameFolder = async () => {
    setIsLoading(true)
    const data = {...folder}
    let res = { kind: 'unknown' }
    data.name = name

    if (data instanceof FolderView) {
      const folderEnc = await folderService.encrypt(data)
      const payload = new FolderRequest(folderEnc)
      res = await folderStore.updateFolder(folder.id, payload)
    }

    if (res.kind === 'ok') {
      notify('success', '', 'Folder updated')
      onClose()
    } else {
      notify('error', '', 'Something went wrong')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setName(folder.name || '')
  }, [isOpen])
  
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
            disabled={isLoading || !name.trim()}
            isLoading={isLoading}
            onPress={renameFolder}
            style={{
              width: '100%'
            }}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
})
