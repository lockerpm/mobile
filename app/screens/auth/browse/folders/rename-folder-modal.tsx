import React, { useState, useEffect } from "react"
import { FloatingInput, Button, Modal } from "../../../../components"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { useCoreService } from "../../../../services/core-service"
import { FolderView } from "../../../../../core/models/view/folderView"
import { FolderRequest } from "../../../../../core/models/request/folderRequest"
import { useMixins } from "../../../../services/mixins"
import { CollectionView } from "../../../../../core/models/view/collectionView"
import { CollectionRequest } from "../../../../../core/models/request/collectionRequest"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  folder: FolderView | CollectionView
}

export const RenameFolderModal = observer((props: Props) => {
  const { isOpen, onClose, folder } = props
  const { folderStore } = useStores()
  const { folderService, collectionService } = useCoreService()
  const { notify, translate, notifyApiError } = useMixins()

  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isExisted = !!name.trim() && folderStore.folders.some(f => f.name && f.name === name)

  const renameFolder = async () => {
    if (!name.trim() || isExisted) {
      return
    }

    setIsLoading(true)
    
    const data = {...folder}
    data.name = name
    let res = { kind: 'unknown' }

    if (folder instanceof FolderView) {
      // @ts-ignore
      const folderEnc = await folderService.encrypt(data)
      const payload = new FolderRequest(folderEnc)
      res = await folderStore.updateFolder(folder.id, payload)
    } else {
      // @ts-ignore
      const collectionEnc = await collectionService.encrypt(data)
      const payload = new CollectionRequest(collectionEnc)
      res = await folderStore.updateFolder(folder.id, payload)
    }

    setIsLoading(false)

    if (res.kind === 'ok') {
      notify('success', translate('folder.folder_updated'))
      onClose()
    } else {
      // @ts-ignore
      notifyApiError(res)
      if (res.kind === 'unauthorized') {
        onClose()
      }
    }
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
        isInvalid={isExisted}
        errorText={translate('folder.folder_existed')}
        label={translate('common.name')}
        value={name}
        onChangeText={txt => setName(txt)}
        onSubmitEditing={renameFolder}
      />

      <Button
        text={translate('common.save')}
        isDisabled={isLoading || !name.trim() || isExisted}
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
