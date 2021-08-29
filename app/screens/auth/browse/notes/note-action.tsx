import React from "react"
import { ActionItem, CipherAction } from "../../../../components"
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