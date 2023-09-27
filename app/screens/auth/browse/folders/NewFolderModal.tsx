/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from 'app/models'
import { useCipherData } from 'app/services/hook'
import { TEAM_COLLECTION_EDITOR } from 'app/static/constants'
import { translate } from 'app/i18n'
import { GeneralApiProblem } from 'app/services/api/apiProblem'
import { FolderView } from 'core/models/view/folderView'
import { CollectionView } from 'core/models/view/collectionView'
import { BottomModal, Button, TextInput } from 'app/components/cores'

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

export const NewFolderModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { folderStore, user, collectionStore, uiStore } = useStores()
  const { createFolder, createCollection } = useCipherData()

  // --------------- PARAMS ----------------

  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [owner, setOwner] = useState('me')

  const [owners, setOwners] = useState([
    { label: translate('common.me'), value: 'me' },
    ...user.teams
      .filter((team) => {
        return TEAM_COLLECTION_EDITOR.includes(team.role)
      })
      .map((team) => {
        return {
          label: team.name,
          value: team.id,
        }
      }),
  ])

  // --------------- COMPUTED ---------------

  const isExisted = (() => {
    if (!name.trim() || isLoading) {
      return false
    }
    if (owner === 'me') {
      return folderStore.folders.some((f) => f.name && f.name === name)
    }
    return collectionStore.collections.some((f) => f.name && f.name === name)
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
    <BottomModal isOpen={isOpen} onClose={onClose} title={translate('folder.create_folder')}>
      <TextInput
        isError={isExisted}
        helper={translate('folder.folder_existed')}
        label={translate('folder.folder_name')}
        value={name}
        onChangeText={(txt) => setName(txt)}
        onSubmitEditing={handleCreateFolder}
      />

      <Button
        text={translate('common.create')}
        disabled={isLoading || !name.trim() || isExisted}
        loading={isLoading}
        onPress={handleCreateFolder}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      />
    </BottomModal>
  )
})
