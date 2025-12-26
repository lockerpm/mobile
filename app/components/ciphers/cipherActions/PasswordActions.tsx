import { Linking } from "react-native"

import { NewActionSheetItem } from "app/components/utils"
import { useClipboard } from "app/services/utils"
import { CipherAppView } from "app/static/types"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { CipherType } from "core/enums"

import { Logger } from "@/utils/logger"

type Props = {
  item: CipherAppView
  onClose: () => void
}

export const PasswordAction = ({ item, onClose }: Props) => {
  const { copyToClipboard } = useClipboard()

  const lockerMasterPassword = item.type === CipherType.MasterPassword

  const launchWebsiteEffort = () => {
    onClose()
    Linking.openURL(item.login.uri).catch((e) => {
      Logger.debug({ err: e.toString(), effort: "Try to open url with 'https://' prefix" })
      Linking.openURL("https://" + item.login.uri)
    })
  }
  return (
    <>
      <NewActionSheetItem
        bottomBorder
        tx="password:launch_website"
        icon="external-link"
        onPress={launchWebsiteEffort}
        hide={!item.login.uri}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!item.login.username || lockerMasterPassword}
        tx="password:copy_username"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(item.login.username)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!item.login.password || !item.viewPassword}
        tx="password:copy_password"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(item.login.password)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!item.login.totp}
        tx="password:copy_totp"
        icon="copy"
        onPress={() => {
          onClose()
          getTOTP(parseOTPUri(item.login.totp)).then((otp) => {
            copyToClipboard(otp)
          })
        }}
      />
    </>
  )
}
