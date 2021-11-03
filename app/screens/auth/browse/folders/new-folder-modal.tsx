import React, { useState, useEffect } from "react"
import { FloatingInput, Button, Modal, Text, DropdownPicker } from "../../../../components"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import { FolderView } from "../../../../../core/models/view/folderView"
import { useCoreService } from "../../../../services/core-service"
import { FolderRequest } from "../../../../../core/models/request/folderRequest"
import { useMixins } from "../../../../services/mixins"
import { fontSize } from "../../../../theme"
import { GeneralApiProblem } from "../../../../services/api/api-problem"
import { CollectionView } from "../../../../../core/models/view/collectionView"
import { CollectionRequest } from "../../../../../core/models/request/collectionRequest"
import { TEAM_COLLECTION_EDITOR } from "../../../../config/constants"


interface Props {
  isOpen?: boolean,
  onClose?: () => void
}

export const NewFolderModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { folderStore, user, collectionStore, uiStore } = useStores()
  const { folderService, collectionService, userService, storageService } = useCoreService()
  const { notify, translate, notifyApiError, randomString, reloadCache } = useMixins()

  // --------------- PARAMS ----------------

  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [owner, setOwner] = useState('me');
  const [owners, setOwners] = useState([
    { label: translate('common.me'), value: 'me' },
    ...user.teams.filter((team) => {
      return TEAM_COLLECTION_EDITOR.includes(team.role)
    }).map((team) => {
      return {
        label: team.name,
        value: team.id
      }
    })
  ])

  // --------------- COMPUTED ----------------

  const isExisted = (() => {
    if (!name.trim()) {
      return false
    }
    if (owner === 'me') {
      return folderStore.folders.some(f => f.name && f.name === name)
    }
    return collectionStore.collections.some(f => f.name && f.name === name)
  })()

  // --------------- METHODS ----------------

  const handleCreateFolder = async () => {
    if (!name.trim() || isExisted) {
      return
    }

    setIsLoading(true)

    let res: { kind: string } | GeneralApiProblem
    if (owner === 'me') {
      const data = new FolderView()
      data.name = name

      // Offline
      if (uiStore.isOffline) {
        await _offlineCreatePersonalFolder(data)
        res = { kind: 'ok' }
      }

      // Online
      else {
        const folderEnc = await folderService.encrypt(data)
        const payload = new FolderRequest(folderEnc)
        res = await folderStore.createFolder(payload)
      }
    } else {
      const data = new CollectionView()
      data.name = name
      data.organizationId = owner
      const folderEnc = await collectionService.encrypt(data)
      const payload = new CollectionRequest(folderEnc)
      res = await collectionStore.createCollection(owner, payload)
    }

    setIsLoading(false)

    if (res.kind === 'ok') {
      notify(
        'success', translate('folder.folder_created') 
        + (uiStore.isOffline ? ` ${translate('success.will_sync_when_online')}` : '')
      )
      setName('')
      onClose()
    } else {
      // @ts-ignore
      notifyApiError(res)
      if (res.kind === 'unauthorized') {
        onClose()
      }
    }
  }

  const _offlineCreatePersonalFolder = async (folder: FolderView) => {
    const userId = await userService.getUserId()
    const key = `folders_${userId}`
    const res = await storageService.get(key)

    const folderEnc = await folderService.encrypt(folder)
    const data = new FolderRequest(folderEnc)
    const tempId = 'tmp__' + randomString()

    res[tempId] = {
      ...data,
      userId,
      id: tempId
    }
    await storageService.save(key, res)
    folderStore.addNotSync(tempId)
    await reloadCache()
  }

  // --------------- EFFECT ----------------

  useEffect(() => {
    if (uiStore.isOffline) {
      setOwner('me')
    }
  }, [isOpen, uiStore.isOffline])

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('folder.create_folder')}
    >
      <Text
        text={translate('common.ownership')}
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontSize: fontSize.small
        }}
      />

      <DropdownPicker
        isDisabled={uiStore.isOffline}
        placeholder={translate('common.select')}
        value={owner}
        items={owners}
        setValue={setOwner}
        setItems={setOwners}
        style={{
          marginBottom: 20
        }}
      />

      <FloatingInput
        persistError
        isInvalid={isExisted}
        errorText={translate('folder.folder_existed')}
        label={translate('common.name')}
        value={name}
        onChangeText={txt => setName(txt)}
        onSubmitEditing={handleCreateFolder}
      />

      <Button
        text={translate('common.create')}
        isDisabled={isLoading || !name.trim() || isExisted}
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
