import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toDriverLicenseData } from "./driver-license.type"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}


export const DriverLicenseAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const driverLicenseData = toDriverLicenseData(selectedCipher.notes)

  const actionFields = [
    {
      label: translate('driver_license.no'),
      value: driverLicenseData.idNO
    },
    {
      label: translate('common.fullname'),
      value: driverLicenseData.fullName
    },
    {
      label: translate('driver_license.class'),
      value: driverLicenseData.class
    },
    {
      label: translate('driver_license.valid_until'),
      value: driverLicenseData.validUntil
    },
    {
      label: translate('driver_license.vehicle_class'),
      value: driverLicenseData.vehicleClass
    },
    {
      label: translate('driver_license.beginning_date'),
      value: driverLicenseData.beginningDate
    },
    {
      label: translate('driver_license.issued_by'),
      value: driverLicenseData.issuedBy
    }
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
            action={() => copyToClipboard(driverLicenseData.notes)}
            disabled={!driverLicenseData.notes}
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
