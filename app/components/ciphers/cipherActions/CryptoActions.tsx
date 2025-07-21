import { NewActionSheetItem } from "app/components/utils"
import { useClipboard } from "app/services/utils"
import { CipherAppView } from "app/static/types"
import { toCryptoWalletData } from "app/utils/crypto"

type Props = {
  item: CipherAppView
  onClose: () => void
}

export const CryptoWalletActions = ({ item, onClose }: Props) => {
  const { copyToClipboard } = useClipboard()
  const data = toCryptoWalletData(item.notes)

  return (
    <>
      <NewActionSheetItem
        bottomBorder
        hide={!data.address}
        tx="crypto_asset:copy_address"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(data.address)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!data.password}
        tx="crypto_asset:copy_password"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(data.password)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!data.pin}
        tx="crypto_asset:copy_pin"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(data.pin)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!data.privateKey.trim()}
        tx="crypto_asset:copy_private_key"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(data.privateKey)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!data.seed.trim()}
        tx="crypto_asset:copy_seed"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(data.seed)
        }}
      />
    </>
  )
}
