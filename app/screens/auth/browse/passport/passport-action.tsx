import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toPassportData } from "./passport.type"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}


export const PassportAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const passportData = toPassportData(selectedCipher.notes)

  const textFields = [
    {
      label: translate('passport.passport_id'),
      value: passportData.passportID
    },
    {
      label: translate('passport.code'),
      value: passportData.code
    },
    {
      label: translate('common.fullname'),
      value: passportData.fullName,
    },
    {
      label: translate('passport.id_number'),
      value: passportData.idNumber,
    },
    {
      label: translate('passport.place_of_issue'),
      value: passportData.placeOfIssue,
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
            disabled={!passportData.notes}
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
