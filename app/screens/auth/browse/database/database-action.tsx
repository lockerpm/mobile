import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toDatabaseData } from "./database.typs"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}


export const DatabaseAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const databaseData = toDatabaseData(selectedCipher.notes)

  const textFields = [
    {
      label: translate('database.host'),
      value: databaseData.host
    },
    {
      label: translate('database.port'),
      value: databaseData.port
    },
    {
      label: translate('common.username'),
      value: databaseData.username
    },
    {
      label: translate('common.password'),
      value: databaseData.password
    },
    {
      label: translate('database.default'),
      value: databaseData.default
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
            disabled={!databaseData.notes}
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
