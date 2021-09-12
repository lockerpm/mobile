import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"


type Props = {
  isOpen?: boolean,
  onClose?: () => void,
  navigation: any
}


export const NoteAction = (props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  return (
    <CipherAction {...props}>
      <ActionItem
        name={translate('note.copy_note')}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.notes)}
        disabled={!selectedCipher.notes}
      />
    </CipherAction>
  )
}
