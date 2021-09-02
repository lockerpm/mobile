import React from "react"
import { CipherView } from "../../../../../core/models/view"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"


type Props = {
  isOpen?: boolean,
  onClose?: Function,
  navigation: any
}


export const IdentityAction = (props: Props) => {
  const { copyToClipboard } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView
  
  return (
    <CipherAction {...props}>
      <ActionItem
        name="Copy full name"
        icon="copy"
        action={() => copyToClipboard(selectedCipher.identity.fullName)}
        disabled={!selectedCipher.identity.fullName}
      />
      <ActionItem
        name="Copy full address"
        icon="copy"
        action={() => copyToClipboard(selectedCipher.identity.fullAddress)}
        disabled={!selectedCipher.identity.fullAddress}
      />
      <ActionItem
        name="Copy full address part 2"
        icon="copy"
        action={() => copyToClipboard(selectedCipher.identity.fullAddressPart2)}
        disabled={!selectedCipher.identity.fullAddressPart2}
      />
    </CipherAction>
  )
}