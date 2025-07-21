import { NewActionSheet, NewActionSheetItem } from "app/components/utils"

interface Props {
  isOpen: boolean
  onClose: () => void
  navigateToQrScan: () => void
  navigateToAddCipher: () => void
}

export const OTPAddAction = ({ isOpen, onClose, navigateToAddCipher, navigateToQrScan }: Props) => {
  return (
    <NewActionSheet isOpen={isOpen} onClose={onClose}>
      <NewActionSheetItem
        bottomBorder
        tx="authenticator:scan_a_qr"
        icon="qr-code"
        onPress={navigateToQrScan}
      />
      <NewActionSheetItem
        tx="authenticator:enter_key"
        icon="keyboard"
        onPress={navigateToAddCipher}
      />
    </NewActionSheet>
  )
}
