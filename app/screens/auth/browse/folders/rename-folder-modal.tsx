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
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  folder: FolderView | CollectionView,
}

export const RenameFolderModal = observer((props: Props) => {
  const { isOpen, onClose, folder } = props
  const { folderStore, collectionStore, uiStore } = useStores()
  const { folderService, collectionService, userService, storageService } = useCoreService()
  const { notify, translate, notifyApiError } = useMixins()
  const { reloadCache } = useCipherDataMixins()

  // --------------- PARAMS ----------------

  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // --------------- COMPUTED ----------------

  const isExisted = (() => {
    if (!name.trim()) {
      return false
    }
    // @ts-ignore
    if (!folder.organizationId) {
      return folderStore.folders.some(f => f.name && f.name === name)
    }
    return collectionStore.collections.some(f => f.name && f.name === name)
  })()

  // --------------- METHODS ----------------

  const renameFolder = async () => {
    if (!name.trim() || isExisted) {
      return
    }

    setIsLoading(true)
    
    const data = {...folder}
    data.name = name
    let res = { kind: 'unknown' }

    // @ts-ignore
    if (!data.organizationId) {
      // Offline
      if (uiStore.isOffline) {
        // @ts-ignore
        await _offlineUpdatePersonalFolder(data)
        res = { kind: 'ok' }
      } else {
        // @ts-ignore
        const folderEnc = await folderService.encrypt(data)
        const payload = new FolderRequest(folderEnc)
        res = await folderStore.updateFolder(folder.id, payload)
      }
    } else {
      // @ts-ignore
      const collectionEnc = await collectionService.encrypt(data)
      const payload = new CollectionRequest(collectionEnc)
      // @ts-ignore
      res = await collectionStore.updateCollection(folder.id, data.organizationId, payload)
    }

    setIsLoading(false)

    if (res.kind === 'ok') {
      notify(
        'success', translate('folder.folder_updated') 
        + (uiStore.isOffline ? ` ${translate('success.will_sync_when_online')}` : '')
      )
      onClose()
    } else {
      // @ts-ignore
      notifyApiError(res)
      if (res.kind === 'unauthorized') {
        onClose()
      }
    }
  }

  const _offlineUpdatePersonalFolder = async (folder: FolderView) => {
    const userId = await userService.getUserId()
    const key = `folders_${userId}`
    const res = await storageService.get(key)

    const folderEnc = await folderService.encrypt(folder)
    const data = new FolderRequest(folderEnc)

    res[folder.id] = {
      ...res[folder.id],
      ...data
    }
    await storageService.save(key, res)
    folderStore.addNotSync(folder.id)
    await reloadCache()
  }

  // --------------- EFFECT ----------------

  useEffect(() => {
    setName(folder.name || '')
  }, [isOpen])

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('folder.rename_folder')}
    >
      <FloatingInput
        persistError
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
