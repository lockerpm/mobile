import React, { useState } from "react"
import { FloatingInput, Button, Text, Modal } from "../../../../components"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import { FolderView } from "../../../../../core/models/view/folderView"
import { useCoreService } from "../../../../services/core-service"
import { FolderRequest } from "../../../../../core/models/request/folderRequest"
import { useMixins } from "../../../../services/mixins"

interface Props {
  isOpen?: boolean,
  onClose?: () => void
}

export const NewFolderModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { folderStore } = useStores()
  const { folderService } = useCoreService()
  const { notify, translate } = useMixins()

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
      title={translate('folder.create_folder')}
    >
      <FloatingInput
        label={translate('common.name')}
        value={name}
        onChangeText={txt => setName(txt)}
      />

      <Button
        text={translate('common.create')}
        disabled={isLoading || !name.trim()}
        isLoading={isLoading}
        onPress={handleCreateFolder}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />
    </Modal>
  )
})
