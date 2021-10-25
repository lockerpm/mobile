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
import { CipherView } from "../../../../core/models/view"
import { View } from "react-native"
import { useCoreService } from "../../../services/core-service"
import { CipherRequest } from "../../../../core/models/request/cipherRequest"


interface Props {
  isOpen?: boolean,
  onClose?: () => void
}

export const ShareModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { user, cipherStore, collectionStore } = useStores()
  const { notify, translate, notifyApiError, getPasswordStrength } = useMixins()
  const { cipherService } = useCoreService()

  const selectedCipher: CipherView = cipherStore.cipherView
  const teams = user.teams.filter((team) => {
    return TEAM_CIPHER_EDITOR.includes(team.role)
  }).map((team) => {
    return {
      label: team.name,
      value: team.id
    }
  })

  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)

  const [owner, setOwner] = useState(null)
  const [owners, setOwners] = useState(teams)
  const [collectionIds, setCollectionIds] = useState([])
  const [writeableCollections, setWriteableCollections] = useState([])

  // --------------- COMPUTED ----------------

  const passwordStrength = (() => {
    if (selectedCipher.login) {
      return getPasswordStrength(selectedCipher.login.password)
    }
    return { score: undefined }
  })()

  // --------------- METHODS ----------------

  const handleShare = async () => {
    setIsLoading(true)

    const cipherEnc = await cipherService.encrypt(selectedCipher)
    const data = new CipherRequest(cipherEnc)
    const res = await cipherStore.shareCipher(selectedCipher.id, data, passwordStrength.score, collectionIds)

    setIsLoading(false)

    if (res.kind === 'ok') {
      notify('success', translate('success.cipher_shared'))
      onClose()
    } else {
      notifyApiError(res)
      if (res.kind === 'unauthorized') {
        onClose()
      }
    }
  }

  // --------------- EFFECT ----------------

  useEffect(() => {
    if (owner) {
      setWriteableCollections(
        collectionStore.collections.filter(c => !c.readOnly && c.organizationId === owner).map(c => ({
          label: c.name,
          value: c.id
        }))
      )
    } else {
      setWriteableCollections([])
    }
  }, [owner])

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpen={() => {
        setOwner(null)
        setOwners(teams)
        setCollectionIds([])
        setWriteableCollections([])
      }}
      title={selectedCipher.name}
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
        placeholder={translate('common.select')}
        emptyText={translate('error.no_team_available')}
        value={owner}
        items={owners}
        setValue={setOwner}
        setItems={setOwners}
        style={{
          marginBottom: 20
        }}
      />

      {
        owner && (
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
              setValue={setCollectionIds}
              setItems={setWriteableCollections}
            />
          </View>
        )
      }

      <Button
        text={translate('common.share')}
        isDisabled={isLoading || !owner || !collectionIds.length}
        isLoading={isLoading}
        onPress={handleShare}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />
    </Modal>
  )
})
