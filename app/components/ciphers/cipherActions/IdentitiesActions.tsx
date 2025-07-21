import { NewActionSheetItem } from "app/components/utils"
import { useClipboard } from "app/services/utils"
import { CipherAppView } from "app/static/types"

type Props = {
  item: CipherAppView
  onClose: () => void
}

export const IdentityAction = ({ item, onClose }: Props) => {
  const { copyToClipboard } = useClipboard()

  return (
    <>
      <NewActionSheetItem
        bottomBorder
        tx="identity:copy_full_name"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(item.identity.fullName)
        }}
        hide={!item.identity.fullName}
      />
      <NewActionSheetItem
        bottomBorder
        tx="identity:copy_full_address"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(item.identity.fullAddress)
        }}
        hide={!item.identity.fullAddress}
      />
      <NewActionSheetItem
        bottomBorder
        tx="identity:copy_full_address_2"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(item.identity.fullAddressPart2)
        }}
        hide={!item.identity.fullAddressPart2}
      />
    </>
  )
}
