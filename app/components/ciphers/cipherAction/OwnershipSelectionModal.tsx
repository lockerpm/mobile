import { useStores } from 'app/models'
import { TEAM_CIPHER_EDITOR } from 'app/static/constants'
import React, { useState, useEffect } from 'react'
import { Text, BottomModal, Button } from '../../cores'
import { DropdownPicker } from '../../utils'
import { useHelper } from 'app/services/hook'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  organizationId: string
  setOrganizationId: (val: any) => void
  collectionIds: string[]
  setCollectionIds: (val: any) => void
}

export const OwnershipSelectionModal = (props: Props) => {
  const { isOpen, onClose, organizationId, setOrganizationId, collectionIds, setCollectionIds } =
    props
  const { translate } = useHelper()
  const { user, collectionStore } = useStores()

  const teams = [
    { label: translate('common.me'), value: null },
    ...user.teams
      .filter((team) => {
        return TEAM_CIPHER_EDITOR.includes(team.role)
      })
      .map((team) => {
        return {
          label: team.name,
          value: team.id,
        }
      }),
  ]

  // --------------- PARAMS ----------------

  const [owners, setOwners] = useState(teams)
  const [writeableCollections, setWriteableCollections] = useState([])

  // --------------- EFFECT ----------------

  useEffect(() => {
    if (organizationId) {
      setWriteableCollections(
        collectionStore.collections
          .filter((c) => !c.readOnly && c.organizationId === organizationId)
          .map((c) => ({
            label: c.name,
            value: c.id,
          }))
      )
    } else {
      setWriteableCollections([])
    }
  }, [organizationId, isOpen])

  useEffect(() => {
    if (isOpen) {
      setOwners(teams)
    }
  }, [isOpen])

  // --------------- RENDER ----------------

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={translate('common.ownership')}>
      <Text
        preset="label"
        size="base"
        text={translate('common.owned_by')}
        style={{
          marginTop: 20,
          marginBottom: 10,
        }}
      />

      <DropdownPicker
        zIndex={2000}
        zIndexInverse={1000}
        placeholder={translate('common.me')}
        value={organizationId}
        items={owners}
        setValue={(val) => setOrganizationId(val)}
        setItems={setOwners}
        style={{
          marginBottom: 20,
        }}
      />

      {organizationId && (
        <>
          <Text
            preset="label"
            size="base"
            text={translate('common.team_folders')}
            style={{
              marginBottom: 10,
            }}
          />

          <DropdownPicker
            multiple
            zIndex={1000}
            zIndexInverse={2000}
            emptyText={translate('error.no_collection_available')}
            placeholder={translate('common.select')}
            value={collectionIds}
            items={writeableCollections}
            setValue={(val) => setCollectionIds(val)}
            setItems={setWriteableCollections}
          />
        </>
      )}

      <Button
        text={translate('common.save')}
        disabled={!organizationId || !collectionIds.length}
        onPress={onClose}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      />
    </BottomModal>
  )
}
