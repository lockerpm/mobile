import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { FolderView } from 'core/models/view/folderView'
import { CollectionView } from 'core/models/view/collectionView'
import { useStores } from 'app/models'
import { useCipherData } from 'app/services/hook'
import { translate } from 'app/i18n'
import { BottomModal, Button, TextInput } from 'app/components-v2/cores'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  folder: FolderView | CollectionView
}

export const RenameFolderModal = observer((props: Props) => {
  const { isOpen, onClose, folder } = props
  const { folderStore, collectionStore } = useStores()
  const { updateFolder, updateCollection } = useCipherData()

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
      return folderStore.folders.some((f) => f.name && f.name === name)
    }
    return collectionStore.collections.some((f) => f.name && f.name === name)
  })()

  // --------------- METHODS ----------------

  const renameFolder = async () => {
    if (!name.trim() || isExisted) {
      return
    }

    setIsLoading(true)

    const data = { ...folder }
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
    <BottomModal isOpen={isOpen} onClose={onClose} title={translate('folder.rename_folder')}>
      <TextInput
        isError={isExisted}
        helper={translate('folder.folder_existed')}
        label={translate('folder.folder_name')}
        value={name}
        onChangeText={(txt) => setName(txt)}
        onSubmitEditing={renameFolder}
      />

      <Button
        text={translate('common.save')}
        disabled={isLoading || !name.trim() || isExisted}
        loading={isLoading}
        onPress={renameFolder}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      />
    </BottomModal>
  )
})
