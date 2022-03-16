import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toCryptoAccountData } from "../../../../utils/crypto"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: Function
}


export const CryptoAccountAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const data = toCryptoAccountData(selectedCipher.notes)

  const renderContent = () => (
    <>
      <ActionItem
        name={translate('crypto_asset.copy_username')}
        icon="copy"
        action={() => copyToClipboard(data.username)}
        disabled={!data.username}
      />

      <ActionItem
        name={translate('crypto_asset.copy_password')}
        icon="copy"
        action={() => copyToClipboard(data.password)}
        disabled={!data.password}
      />
    </>
  )

  return (
    <CipherAction {...props}>
      {renderContent()}
    </CipherAction>
  )
})
