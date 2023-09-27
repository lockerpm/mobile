import { ActionItem, CipherAction } from 'app/components/ciphers'
import { translate } from 'app/i18n'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { toCryptoWalletData } from 'app/utils/crypto'
import { observer } from 'mobx-react-lite'
import React from 'react'

type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}

export const CryptoWalletAction = observer((props: Props) => {
  const { copyToClipboard } = useHelper()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const data = toCryptoWalletData(selectedCipher.notes)

  const renderContent = () => (
    <>
      <ActionItem
        name={translate('crypto_asset.copy_address')}
        icon="copy"
        action={() => copyToClipboard(data.address)}
        disabled={!data.address}
      />

      <ActionItem
        name={translate('crypto_asset.copy_password')}
        icon="copy"
        action={() => copyToClipboard(data.password)}
        disabled={!data.password}
      />

      <ActionItem
        name={translate('crypto_asset.copy_pin')}
        icon="copy"
        action={() => copyToClipboard(data.password)}
        disabled={!data.password}
      />

      <ActionItem
        name={translate('crypto_asset.copy_private_key')}
        icon="copy"
        action={() => copyToClipboard(data.privateKey)}
        disabled={!data.privateKey}
      />

      <ActionItem
        name={translate('crypto_asset.copy_seed')}
        icon="copy"
        action={() => copyToClipboard(data.seed)}
        disabled={!data.seed}
      />
      {__DEV__ && (
        <ActionItem
          name={'(DEBUG) Copy notes'}
          icon="copy"
          action={() => copyToClipboard(selectedCipher.notes)}
          disabled={!data.seed}
        />
      )}
    </>
  )

  return <CipherAction {...props}>{renderContent()}</CipherAction>
})
