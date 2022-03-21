import React, { useState, useEffect } from "react"
import { FloatingInput, Button, Modal } from "../../../../components"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { FolderView } from "../../../../../core/models/view/folderView"
import { useMixins } from "../../../../services/mixins"
import { CollectionView } from "../../../../../core/models/view/collectionView"
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  folder: FolderView | CollectionView,
}

export const RenameFolderModal = observer((props: Props) => {
  const { isOpen, onClose, folder } = props
  const { folderStore, collectionStore } = useStores()
  const { translate } = useMixins()
  const { updateFolder, updateCollection } = useCipherDataMixins()

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
      // @ts-ignore
      res = await updateFolder(data)
    } else {
      // @ts-ignore
      res = await updateCollection(data)
    }

    setIsLoading(false)

    if (res.kind === 'ok') {
      onClose()
    } else {
      if (res.kind === 'unauthorized') {
        onClose()
      }
    }
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
        label={translate('folder.folder_name')}
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
