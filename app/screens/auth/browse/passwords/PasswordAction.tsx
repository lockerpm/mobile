import React from "react"
import { Linking } from "react-native"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import { Logger } from "app/utils/utils"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { ActionItem } from "app/components/ciphers/actionsSheet/ActionSheetItem"
import { CipherAction } from "app/components/ciphers/cipherAction/CipherAction"

type Props = {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  isEmergencyView?: boolean
}

export const PasswordAction = (props: Props) => {
  const { copyToClipboard, translate } = useHelper()
  const { cipherStore } = useStores()

  const selectedCipher: CipherView = cipherStore.cipherView
  const lockerMasterPassword = selectedCipher?.type === CipherType.MasterPassword
  const launchWebsiteEffort = () => {
    Linking.openURL(selectedCipher.login.uri).catch((e) => {
      Logger.debug({ err: e.toString(), effort: "Try to open url with 'https://' prefix" })
      Linking.openURL("https://" + selectedCipher.login.uri)
    })
    props.onClose && props.onClose()
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
          action={() => {
            props.onClose && props.onClose()
            copyToClipboard(selectedCipher.login.username)
          }}
          disabled={!selectedCipher.login.username}
        />
      )}

      <ActionItem
        name={translate("password.copy_password")}
        icon="copy"
        action={() => {
          props.onClose && props.onClose()
          copyToClipboard(selectedCipher.login.password)
        }}
        disabled={!selectedCipher.login.password || !selectedCipher.viewPassword}
      />

      <ActionItem
        name={translate("password.copy_totp")}
        icon="copy"
        action={() => {
          props.onClose && props.onClose()
          copyToClipboard(getTOTP(parseOTPUri(selectedCipher.login.totp)))
        }}
        disabled={!selectedCipher.login.totp}
      />
    </>
  )

  return <CipherAction {...props}>{renderContent()}</CipherAction>
}
