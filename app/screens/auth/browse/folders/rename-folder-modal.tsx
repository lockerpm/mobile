import React, { useState, useEffect } from "react"
import { FloatingInput, Button, Text, Modal } from "../../../../components"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { useCoreService } from "../../../../services/core-service"
import { FolderView } from "../../../../../core/models/view/folderView"
import { FolderRequest } from "../../../../../core/models/request/folderRequest"
import { useMixins } from "../../../../services/mixins"
import { CollectionView } from "../../../../../core/models/view/collectionView"
import { translate } from "../../../../i18n"
import { fontSize } from "../../../../theme"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
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
      notify('success', translate('folder.folder_updated'))
      onClose()
    } else {
      notify('error', translate('error.something_went_wrong'))
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
      title={translate('folder.rename_folder')}
    >
      <FloatingInput
        label={translate('common.name')}
        value={name}
        onChangeText={txt => setName(txt)}
      />

      <Button
        text={translate('common.save')}
        disabled={isLoading || !name.trim()}
        isLoading={isLoading}
        onPress={renameFolder}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />
    </Modal>
  )
})
