import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { SharedMemberType } from "../../../../../services/api/api.types"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { CipherView } from "../../../../../../core/models/view"
import { AccountRoleText } from "../../../../../config/types"
import { Button, DropdownPicker, Modal, Text } from "../../../../../components"
import { fontSize } from "../../../../../theme"


interface Props {
  isOpen?: boolean,
  onClose?: () => void
  member: SharedMemberType
}

export const EditShareModal = observer((props: Props) => {
  const { isOpen, onClose, member } = props
  const { cipherStore } = useStores()
  const { translate } = useMixins()
  const { editShareCipher } = useCipherDataMixins()

  const selectedCipher: CipherView = cipherStore.cipherView
  const shareTypes = [
    translate('shares.share_type.only_fill'),
    translate('shares.share_type.view'),
    translate('shares.share_type.edit')
  ]

  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)
  const [shareType, setShareType] = useState(1)

  // --------------- COMPUTED ----------------

  const initialShareType = (() => {
    if (member) {
      if (member.role === AccountRoleText.ADMIN) {
        return 2
      }
      if (member.hide_passwords) {
        return 0
      }
    }
    return 1
  })()

  // --------------- METHODS ----------------

  const handleEditShare = async () => {
    setIsLoading(true)

    let role = AccountRoleText.MEMBER
    let autofillOnly = false
    switch (shareType) {
      case 0:
        autofillOnly = true
        break
      case 2:
        role = AccountRoleText.ADMIN
        break
    }
    const res = await editShareCipher(selectedCipher.organizationId, member.id, role, autofillOnly)

    setIsLoading(false)

    if (res.kind === 'ok' || res.kind === 'unauthorized') {
      onClose()
    }
  }

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpen={() => {
        setShareType(initialShareType)
      }}
      title={selectedCipher.name}
    >
      <Text
        text={translate('common.user')}
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontSize: fontSize.small
        }}
      />

      <Text
        preset="black"
        text={`${member?.full_name} (${member?.email})`}
      />

      <Text
        text={translate('shares.share_type.label')}
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontSize: fontSize.small
        }}
      />

      <DropdownPicker
        zIndex={2000}
        zIndexInverse={1000}
        placeholder={translate('common.select')}
        value={shareType}
        items={shareTypes.map((t, index) => ({ label: t, value: index }))}
        setValue={setShareType}
        setItems={() => {}}
        style={{
          marginBottom: 20
        }}
      />

      <Button
        text={translate('common.edit')}
        isDisabled={isLoading}
        isLoading={isLoading}
        onPress={handleEditShare}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />
    </Modal>
  )
})
