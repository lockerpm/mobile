import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { Modal } from "../../modal/modal"
import { DropdownPicker } from "../../dropdown-picker/dropdown-picker"
import { Button } from "../../button/button"
import { Text } from "../../text/text"
import { fontSize } from "../../../theme"
import { CipherView } from "../../../../core/models/view"
import { useCoreService } from "../../../services/core-service"
import { CipherRequest } from "../../../../core/models/request/cipherRequest"
import isEqual from "lodash/isEqual"


interface Props {
  isOpen?: boolean,
  onClose?: () => void
}

export const ChangeTeamFolderModal = observer((props: Props) => {
  const { isOpen, onClose } = props
  const { cipherStore, collectionStore } = useStores()
  const { notify, translate, notifyApiError, getPasswordStrength } = useMixins()
  const { cipherService } = useCoreService()

  const selectedCipher: CipherView = cipherStore.cipherView
  const teamCollections = collectionStore.collections.filter(c => (
    !c.readOnly 
    && c.organizationId === selectedCipher.organizationId
  )).map(c => ({
    label: c.name,
    value: c.id
  }))

  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)

  const [collectionIds, setCollectionIds] = useState(selectedCipher.collectionIds)
  const [writeableCollections, setWriteableCollections] = useState(teamCollections)

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
    const res = await cipherStore.updateCipher(selectedCipher.id, data, passwordStrength.score, collectionIds)

    setIsLoading(false)

    if (res.kind === 'ok') {
      notify('success', translate('success.cipher_updated'))
      onClose()
    } else {
      notifyApiError(res)
      if (res.kind === 'unauthorized') {
        onClose()
      }
    }
  }

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpen={() => {
        setCollectionIds(selectedCipher.collectionIds)
        setWriteableCollections(teamCollections)
      }}
      title={selectedCipher.name}
    >
      <Text
        text={translate('common.team_folders')}
        style={{
          marginTop: 20,
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

      <Button
        text={translate('common.save')}
        isDisabled={isLoading || (collectionIds && !collectionIds.length) || isEqual(collectionIds, selectedCipher.collectionIds)}
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
