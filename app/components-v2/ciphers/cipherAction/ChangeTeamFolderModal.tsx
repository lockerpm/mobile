import React, { useEffect, useState } from 'react'
import isEqual from 'lodash/isEqual'
import { useStores } from 'app/models'
import { useCipherHelper, useHelper } from 'app/services/hook'
import { useCoreService } from 'app/services/coreService'
import { CipherView } from 'core/models/view'
import { CipherRequest } from 'core/models/request'
import { translate } from 'app/i18n'
import { BottomModal, Button, Text } from 'app/components-v2/cores'
import { DropdownPicker } from 'app/components-v2/utils'

interface Props {
  isOpen?: boolean
  onClose?: () => void
}

export const ChangeTeamFolderModal = (props: Props) => {
  const { isOpen, onClose } = props
  const { cipherStore, collectionStore } = useStores()
  const { notify, notifyApiError } = useHelper()
  const { getPasswordStrength } = useCipherHelper()
  const { cipherService } = useCoreService()

  const selectedCipher: CipherView = cipherStore.cipherView
  const teamCollections = collectionStore.collections
    .filter((c) => !c.readOnly && c.organizationId === selectedCipher.organizationId)
    .map((c) => ({
      label: c.name,
      value: c.id,
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
    const res = await cipherStore.updateCipher(
      selectedCipher.id,
      data,
      passwordStrength.score,
      collectionIds
    )

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

  useEffect(() => {
    if (isOpen) {
      setCollectionIds(selectedCipher.collectionIds)
      setWriteableCollections(teamCollections)
    }
  }, [isOpen])
  // --------------- RENDER ----------------

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedCipher.name}
    >
      <Text
        text={translate('common.team_folders')}
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontSize: 14,
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
        disabled={
          isLoading ||
          (collectionIds && !collectionIds.length) ||
          isEqual(collectionIds, selectedCipher.collectionIds)
        }
        loading={isLoading}
        onPress={handleShare}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      />
    </BottomModal>
  )
}
