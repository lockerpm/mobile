import { ActionItem } from "app/components/ciphers/actionsSheet/ActionSheetItem"
import { CipherAction } from "app/components/ciphers/cipherAction/CipherAction"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { CipherView } from "core/models/view"
import React from "react"

type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}

export const IdentityAction = (props: Props) => {
  const { copyToClipboard, translate } = useHelper()
  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  const renderContent = () => (
    <>
      <ActionItem
        name={translate("identity.copy_full_name")}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.identity.fullName)}
        disabled={!selectedCipher.identity.fullName}
      />
      <ActionItem
        name={translate("identity.copy_full_address")}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.identity.fullAddress)}
        disabled={!selectedCipher.identity.fullAddress}
      />
      <ActionItem
        name={translate("identity.copy_full_address_2")}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.identity.fullAddressPart2)}
        disabled={!selectedCipher.identity.fullAddressPart2}
      />
    </>
  )

  return <CipherAction {...props}>{renderContent()}</CipherAction>
}
