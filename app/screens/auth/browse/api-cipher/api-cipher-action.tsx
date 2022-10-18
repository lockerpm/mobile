import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toApiCipherData } from "./api-cipher.type"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}


export const ApiCipherAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const data = toApiCipherData(selectedCipher.notes)

  const renderContent = () => (
    <>
      <ActionItem
        name={translate('API.url')}
        icon="copy"
        action={() => copyToClipboard(data.url)}
        disabled={!data.url}
      />

      <ActionItem
        name={translate('API.header')}
        icon="copy"
        action={() => copyToClipboard(data.header)}
        disabled={!data.header}
      />

      <ActionItem
        name={translate('API.body_data')}
        icon="copy"
        action={() => copyToClipboard(data.bodyData)}
        disabled={!data.bodyData}
      />

      <ActionItem
        name={translate('API.response')}
        icon="copy"
        action={() => copyToClipboard(data.response)}
        disabled={!data.response}
      />

      {
        __DEV__ && (
          <ActionItem
            name={'(DEBUG) Copy notes'}
            icon="copy"
            action={() => copyToClipboard(selectedCipher.notes)}
            disabled={!data.notes}
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
