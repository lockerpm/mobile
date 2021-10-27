import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { TEAM_CIPHER_EDITOR } from "../../../config/constants"
import { Modal } from "../../modal/modal"
import { DropdownPicker } from "../../dropdown-picker/dropdown-picker"
import { Button } from "../../button/button"
import { Text } from "../../text/text"
import { fontSize } from "../../../theme"
import { View } from "react-native"


interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  organizationId: string,
  setOrganizationId: Function,
  collectionIds: string[],
  setCollectionIds: Function
}

export const OwnershipSelectionModal = observer((props: Props) => {
  const { isOpen, onClose, organizationId, setOrganizationId, collectionIds, setCollectionIds } = props
  const { user, collectionStore } = useStores()
  const { translate } = useMixins()

  const teams = [
    { label: translate('common.me'), value: null },
    ...user.teams.filter((team) => {
      return TEAM_CIPHER_EDITOR.includes(team.role)
    }).map((team) => {
      return {
        label: team.name,
        value: team.id
      }
    })
  ]

  // --------------- PARAMS ----------------

  const [owners, setOwners] = useState(teams)
  const [writeableCollections, setWriteableCollections] = useState([])

  // --------------- EFFECT ----------------

  useEffect(() => {
    if (organizationId) {
      setWriteableCollections(
        collectionStore.collections.filter(c => !c.readOnly && c.organizationId === organizationId).map(c => ({
          label: c.name,
          value: c.id
        }))
      )
    } else {
      setWriteableCollections([])
    }
  }, [organizationId, isOpen])

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpen={() => {
        setOwners(teams)
      }}
      title={translate('common.ownership')}
    >
      <Text
        text={translate('common.owned_by')}
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontSize: fontSize.small
        }}
      />

      <DropdownPicker
        placeholder={translate('common.me')}
        value={organizationId}
        items={owners}
        setValue={val => setOrganizationId(val)}
        setItems={setOwners}
        style={{
          marginBottom: 20
        }}
      />

      {
        organizationId && (
          <View style={{
            zIndex: 100
          }}>
            <Text
              text={translate('common.team_folders')}
              style={{
                marginBottom: 10,
                fontSize: fontSize.small
              }}
            />

            <DropdownPicker
              multiple
              emptyText={translate('error.no_collection_available')}
              placeholder={translate('common.select')}
              value={collectionIds}
              items={writeableCollections}
              setValue={val => setCollectionIds(val)}
              setItems={setWriteableCollections}
            />
          </View>
        )
      }

      <Button
        text={translate('common.save')}
        isDisabled={!organizationId || !collectionIds.length}
        onPress={onClose}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />
    </Modal>
  )
})
