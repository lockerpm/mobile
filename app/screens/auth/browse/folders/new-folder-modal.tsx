import React, { useState, useEffect } from "react"
import { FloatingInput, Button, Modal, Text, DropdownPicker } from "../../../../components"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import { FolderView } from "../../../../../core/models/view/folderView"
import { useMixins } from "../../../../services/mixins"
import { fontSize } from "../../../../theme"
import { GeneralApiProblem } from "../../../../services/api/api-problem"
import { CollectionView } from "../../../../../core/models/view/collectionView"
import { TEAM_COLLECTION_EDITOR } from "../../../../config/constants"
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"


interface Props {
  isOpen?: boolean,
  onClose?: () => void
}

export const NewFolderModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { folderStore, user, collectionStore, uiStore } = useStores()
  const { translate } = useMixins()
  const { createFolder, createCollection } = useCipherDataMixins()

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
      res = await createFolder(data)
    } else {
      const data = new CollectionView()
      data.name = name
      data.organizationId = owner
      res = await createCollection(data)
    }

    setIsLoading(false)

    if (res.kind === 'ok') {
      setName('')
      onClose()
    } else {
      if (res.kind === 'unauthorized') {
        onClose()
      }
    }
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
