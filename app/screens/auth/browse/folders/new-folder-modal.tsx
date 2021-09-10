import React, { useState } from "react"
import { Modal } from "native-base"
import { FloatingInput, Button, Text } from "../../../../components"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import { FolderView } from "../../../../../core/models/view/folderView"
import { useCoreService } from "../../../../services/core-service"
import { FolderRequest } from "../../../../../core/models/request/folderRequest"
import { useMixins } from "../../../../services/mixins"
import { translate } from "../../../../i18n"
import { fontSize } from "../../../../theme"

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
      notify('success', translate('folder.folder_created'))
      onClose()
    } else {
      notify('error', translate('error.something_went_wrong'))
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
            text={translate('folder.create_folder')}
            style={{
              fontSize: fontSize.h4
            }}
          />
        </Modal.Header>
        <Modal.Body>
          <FloatingInput
            label={translate('common.name')}
            value={name}
            onChangeText={txt => setName(txt)}
          />
        </Modal.Body>
        <Modal.Footer style={{ marginRight: 20, marginBottom: 16, paddingRight: 0 }}>
          <Button
            text={translate('common.create')}
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
