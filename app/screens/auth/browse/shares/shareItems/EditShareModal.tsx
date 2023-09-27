import React, { useEffect, useState } from 'react'
import { BottomModal, Button, Text } from 'app/components/cores'
import { translate } from 'app/i18n'
import { useStores } from 'app/models'
import { useCipherData } from 'app/services/hook'
import { AccountRoleText, SharedMemberType } from 'app/static/types'
import { CipherView } from 'core/models/view'
import { DropdownPicker } from 'app/components/utils'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  member: SharedMemberType
}

export const EditShareModal = (props: Props) => {
  const { isOpen, onClose, member } = props
  const { cipherStore } = useStores()
  const { editShareCipher } = useCipherData()

  const selectedCipher: CipherView = cipherStore.cipherView
  const shareTypes = [
    // {
    //   label: translate('shares.share_type.only_fill'),
    //   value: 'only_fill'
    // },
    {
      label: translate('shares.share_type.view'),
      value: 'view',
    },
    {
      label: translate('shares.share_type.edit'),
      value: 'edit',
    },
  ]

  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)
  const [shareType, setShareType] = useState('view')

  // --------------- COMPUTED ----------------

  const initialShareType = (() => {
    if (member) {
      if (member.role === AccountRoleText.ADMIN) {
        return 'edit'
      }
      if (member.hide_passwords) {
        return 'only_fill'
      }
    }
    return 'view'
  })()

  // --------------- METHODS ----------------

  const handleEditShare = async () => {
    setIsLoading(true)

    let role = AccountRoleText.MEMBER
    let autofillOnly = false
    switch (shareType) {
      case 'only_fill':
        autofillOnly = true
        break
      case 'edit':
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

  useEffect(() => {
    if (isOpen) {
      setShareType(initialShareType)
    }
  }, [isOpen])

  // --------------- RENDER ----------------

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={selectedCipher.name}>
      <Text
        preset="label"
        size="base"
        text={translate('common.user')}
        style={{
          marginTop: 20,
          marginBottom: 10,
        }}
      />

      <Text text={`${member?.full_name} (${member?.email})`} />

      <Text
        preset="label"
        size="base"
        text={translate('shares.share_type.label')}
        style={{
          marginTop: 20,
          marginBottom: 10,
        }}
      />

      <DropdownPicker
        zIndex={2000}
        zIndexInverse={1000}
        placeholder={translate('common.select')}
        value={shareType}
        items={shareTypes}
        setValue={setShareType}
        setItems={() => {
          //
        }}
        style={{
          marginBottom: 20,
        }}
      />

      <Button
        text={translate('common.edit')}
        disabled={isLoading}
        loading={isLoading}
        onPress={handleEditShare}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      />
    </BottomModal>
  )
}
