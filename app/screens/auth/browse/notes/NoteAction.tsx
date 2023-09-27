import { ActionItem, CipherAction } from 'app/components/ciphers'
import { translate } from 'app/i18n'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import React from 'react'

type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  isEmergencyView?: boolean
}

export const NoteAction = (props: Props) => {
  const { copyToClipboard } = useHelper()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const renderContent = () => (
    <ActionItem
      name={translate('note.copy_note')}
      icon="copy"
      action={() => copyToClipboard(selectedCipher.notes)}
      disabled={!selectedCipher.notes}
    />
  )

  return <CipherAction {...props}>{renderContent()}</CipherAction>
}
