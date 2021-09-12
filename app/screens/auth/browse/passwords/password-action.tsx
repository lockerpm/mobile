import React from "react"
import { Linking } from "react-native"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"
import { ActionItem } from "../../../../components/cipher/cipher-action/action-item"


type Props = {
  isOpen?: boolean,
  onClose?: () => void,
  navigation: any
}


export const PasswordAction = (props: Props) => {
  const { copyToClipboard, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  return (
    <CipherAction {...props}>
      <ActionItem
        name={translate('password.launch_website')}
        icon="external-link"
        action={() => Linking.openURL(selectedCipher.login.uri)}
        disabled={!selectedCipher.login.uri}
      />

      <ActionItem
        name={translate('password.copy_username')}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.login.username)}
        disabled={!selectedCipher.login.username}
      />

      <ActionItem
        name={translate('password.copy_password')}
        icon="copy"
        action={() => copyToClipboard(selectedCipher.login.password)}
        disabled={!selectedCipher.login.password}
      />
    </CipherAction>
  )
}
