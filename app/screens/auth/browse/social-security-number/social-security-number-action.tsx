import { observer } from "mobx-react-lite"
import React from "react"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { toSocialSecurityNumberData } from "./social-security-number.type"


type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}


export const SocialSecurityNumberAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  const socialSecurityNumberData = toSocialSecurityNumberData(selectedCipher.notes)

  const textFields = [
    {
      label: translate('common.fullname'),
      value: socialSecurityNumberData.fullName
    },
    {
      label: translate('common.social_security_number'),
      value: socialSecurityNumberData.socialSecurityNumber
    },
    {
      label: translate('passport.date_of_issue'),
      value: socialSecurityNumberData.dateOfIssue
    },
    {
      label: translate('common.nationality'),
      value: socialSecurityNumberData.contry
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
            disabled={!socialSecurityNumberData.notes}
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
