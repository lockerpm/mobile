import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toWirelessRouterData } from "./wireless-router.type"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}


export const WirelessRouterAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const wirelessRouterData = toWirelessRouterData(selectedCipher.notes)

  const textFields = [
    {
      label: translate('wireless_router.device_name'),
      value: wirelessRouterData.deviceName,
    },
    {
      label: translate('wireless_router.router_ip_address'),
      value: wirelessRouterData.ipAddress,
    },
    {
      label: translate('wireless_router.admin_username'),
      value: wirelessRouterData.adminUsername,
    },
    {
      label: translate('wireless_router.admin_password'),
      value: wirelessRouterData.adminPassword,
    },
    {
      label: translate('wireless_router.wifi_ssid'),
      value: wirelessRouterData.wifiSSID,
    },
    {
      label: translate('wireless_router.wifi_pw'),
      value: wirelessRouterData.wifiPassword,
    }
  ]
  const renderContent = () => (
    <>
      {
        textFields.map((e, index) => <ActionItem
          key={index}
          name={e.label}
          icon="copy"
          action={() => copyToClipboard(e.value)}
          disabled={!e.value}
        />
        )
      }
    </>
  )

  return (
    <CipherAction {...props}>
      {renderContent()}
    </CipherAction>
  )
})
