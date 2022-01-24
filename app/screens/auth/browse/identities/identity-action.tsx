import { observer } from "mobx-react-lite"
import React from "react"
import { CipherView } from "../../../../../core/models/view"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { SharedItemAction } from "../../../../components/cipher/cipher-action/shared-item-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: Function
}


export const IdentityAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  const isShared = !!selectedCipher.organizationId

  const renderContent = () => (
    <>
      <ActionItem
        name={translate('identity.copy_full_name')}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.identity.fullName)}
        disabled={!selectedCipher.identity.fullName}
      />
      <ActionItem
        name={translate('identity.copy_full_address')}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.identity.fullAddress)}
        disabled={!selectedCipher.identity.fullAddress}
      />
      <ActionItem
        name={translate('identity.copy_full_address_2')}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.identity.fullAddressPart2)}
        disabled={!selectedCipher.identity.fullAddressPart2}
      />
    </>
  )

  return isShared ? (
    <SharedItemAction {...props}>
      {renderContent()}
    </SharedItemAction>
  ) : (
    <CipherAction {...props}>
      {renderContent()}
    </CipherAction>
  )
})
