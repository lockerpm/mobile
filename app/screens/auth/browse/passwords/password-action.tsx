import React from "react"
import { Linking } from "react-native"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"
import { CipherView } from "../../../../../core/models/view"
import { observer } from "mobx-react-lite"
import { Logger } from "../../../../utils/utils"
import { CipherType } from "../../../../../core/enums"
import { getTOTP, parseOTPUri } from "../../../../utils/totp"

type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: Function
  isEmergencyView?: boolean
}

export const PasswordAction = observer((props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView
  const lockerMasterPassword = selectedCipher?.type === CipherType.MasterPassword
  const launchWebsiteEffort = () => {
    Linking.openURL(selectedCipher.login.uri).catch((e) => {
      Logger.debug({ err: e.toString(), effort: "Try to open url with 'https://' prefix" })
      Linking.openURL("https://" + selectedCipher.login.uri)
    })
  }

  const renderContent = () => (
    <>
      <ActionItem
        name={translate("password.launch_website")}
        icon="external-link"
        action={launchWebsiteEffort}
        disabled={!selectedCipher.login.uri}
      />

      {!lockerMasterPassword && (
        <ActionItem
          name={translate("password.copy_username")}
          icon="copy"
          action={() => copyToClipboard(selectedCipher.login.username)}
          disabled={!selectedCipher.login.username}
        />
      )}

      <ActionItem
        name={translate("password.copy_password")}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.login.password)}
        disabled={!selectedCipher.login.password || !selectedCipher.viewPassword}
      />

      <ActionItem
        name={translate("password.copy_totp")}
        icon="copy"
        action={() => copyToClipboard(getTOTP(parseOTPUri(selectedCipher.login.totp)))}
        disabled={!selectedCipher.login.totp}
      />
    </>
  )

  return <CipherAction {...props}>{renderContent()}</CipherAction>
})
