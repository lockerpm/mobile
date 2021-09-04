import React from "react"
import { Linking } from "react-native"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"


type Props = {
  isOpen?: boolean,
  onClose?: Function,
  navigation: any
}


export const PasswordAction = (props: Props) => {
  const { copyToClipboard } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  return (
    <CipherAction {...props}>
      <ActionItem
        name="Launch Website"
        icon="external-link"
        action={() => Linking.openURL(selectedCipher.login.uri)}
        disabled={!selectedCipher.login.uri}
      />

      <ActionItem
        name="Copy Email or Username"
        icon="copy"
        action={() => copyToClipboard(selectedCipher.login.username)}
        disabled={!selectedCipher.login.username}
      />

      <ActionItem
        name="Copy Password"
        icon="copy"
        action={() => copyToClipboard(selectedCipher.login.password)}
        disabled={!selectedCipher.login.password}
      />
    </CipherAction>
  )
}