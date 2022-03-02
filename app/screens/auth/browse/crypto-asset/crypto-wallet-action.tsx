import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toCryptoWalletData } from "../../../../utils/crypto"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: Function
}


export const CryptoWalletAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const data = toCryptoWalletData(selectedCipher.notes)

  const renderContent = () => (
    <ActionItem
      name={translate('crypto_asset.copy_seed')}
      icon="copy"
      action={() => copyToClipboard(data.seed)}
      disabled={!data.seed}
    />
  )

  return (
    <CipherAction {...props}>
      {renderContent()}
    </CipherAction>
  )
})
