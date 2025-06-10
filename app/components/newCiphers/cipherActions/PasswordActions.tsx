import React from "react"
import { Linking } from "react-native"
import { CipherType } from "core/enums"
import { Logger } from "app/utils/utils"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { CipherAppView } from "app/static/types"
import { useClipboard } from "app/services/utils"
import { NewActionSheetItem } from "app/components/utils"

type Props = {
  item: CipherAppView
  onClose: () => void
}

export const PasswordAction = ({ item, onClose }: Props) => {
  const { copyToClipboard } = useClipboard()

  const lockerMasterPassword = item.type === CipherType.MasterPassword

  const launchWebsiteEffort = () => {
    Linking.openURL(item.login.uri).catch((e) => {
      Logger.debug({ err: e.toString(), effort: "Try to open url with 'https://' prefix" })
      Linking.openURL("https://" + item.login.uri)
    })
    onClose()
  }
  return (
    <>
      <NewActionSheetItem
        bottomBorder
        tx="password.launch_website"
        icon="external-link"
        onPress={launchWebsiteEffort}
        hide={!item.login.uri}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!item.login.username || lockerMasterPassword}
        tx="password.copy_username"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(item.login.username)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!item.login.password || !item.viewPassword}
        tx="password.copy_password"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(item.login.password)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!item.login.totp}
        tx="password.copy_totp"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(getTOTP(parseOTPUri(item.login.totp)))
        }}
      />
    </>
  )
}
