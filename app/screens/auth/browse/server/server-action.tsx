import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toServerData } from "./server.type"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}


export const ServerAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const serverData = toServerData(selectedCipher.notes)

  const textFields = [
    {
      label: translate('server.host'),
      value: serverData.host,
    },
    {
      label: translate('server.public_key'),
      value: serverData.publicKey,
    },
    {
      label: translate('server.private_key'),
      value: serverData.privateKey,
    },
    {
      label: translate('common.username'),
      value: serverData.username,
    },
    {
      label: translate('common.password'),
      value: serverData.password,
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

      {
        __DEV__ && (
          <ActionItem
            name={'(DEBUG) Copy notes'}
            icon="copy"
            action={() => copyToClipboard(selectedCipher.notes)}
            disabled={!serverData.notes}
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
