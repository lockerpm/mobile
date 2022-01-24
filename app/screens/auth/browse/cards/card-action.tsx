import { observer } from "mobx-react-lite"
import React from "react"
import { CipherView } from "../../../../../core/models/view"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { SharedItemAction } from "../../../../components/cipher/cipher-action/shared-item-action"
import { useStores } from "../../../../models"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: Function
}


export const CardAction = observer((props: Props) => {
  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  const isShared = !!selectedCipher.organizationId

  return isShared ? (
    <SharedItemAction {...props}>
    </SharedItemAction>
  ) : (
    <CipherAction {...props}>
    </CipherAction>
  )
})