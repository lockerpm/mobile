import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"


type Props = {
  isOpen?: boolean,
  onClose?: Function,
  navigation: any
}


export const NoteAction = (props: Props) => {
  const { copyToClipboard } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  return (
    <CipherAction {...props}>
      <ActionItem
        name="Copy Note"
        icon="copy"
        action={() => copyToClipboard(selectedCipher.notes)}
        disabled={!selectedCipher.notes}
      />
    </CipherAction>
  )
}