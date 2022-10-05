import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toCitizenIdData } from "./citizen-id.type"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}


export const CitizenIDAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const citizenIdData = toCitizenIdData(selectedCipher.notes)

  const actionFields = [
    {
      label: translate('citizen_id.id_no'),
      value: citizenIdData.idNo
    },
    {
      label: translate('common.fullname'),
      value: citizenIdData.fullName
    },
    {
      label: translate('citizen_id.place_of_origin'),
      value: citizenIdData.placeOfOrigin
    },
    {
      label: translate('citizen_id.place_of_residence'),
      value: citizenIdData.placeOfResidence
    },
    {
      label: translate('citizen_id.expiry_date'),
      value: citizenIdData.expiryDate
    },
    {
      label: translate('citizen_id.date_of_issue'),
      value: citizenIdData.dateOfIssue
    },
    {
      label: translate('citizen_id.issued_by'),
      value: citizenIdData.issueBy
    },
  ]

  const renderContent = () => (
    <>
      {
        actionFields.map((e, index) => <ActionItem
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
            action={() => copyToClipboard(citizenIdData.notes)}
            disabled={!citizenIdData.notes}
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
