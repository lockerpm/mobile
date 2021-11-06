import React from "react"
import { ActionSheet, ActionSheetContent, ActionItem } from "../../../../components"
import { useMixins } from "../../../../services/mixins"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  navigation?: any
}

export const AuthenticatorAddAction = (props: Props) => {
  const { translate } = useMixins()

  return (
    <ActionSheet
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ActionSheetContent>
        <ActionItem
          name={translate('authenticator.scan_a_qr')}
          icon="qrcode"
          action={() => {
            props.onClose && props.onClose()
            props.navigation && props.navigation.navigate('qrScanner')
          }}
        />
        <ActionItem
          name={translate('authenticator.enter_key')}
          icon="keyboard-o"
          action={() => {
            props.onClose && props.onClose()
            props.navigation && props.navigation.navigate('authenticator__edit')
          }}
        />
        <ActionItem
          name={translate('authenticator.import_from_google_authenticator')}
          icon="google"
          action={() => {
            props.onClose && props.onClose()
            props.navigation && props.navigation.navigate('googleAuthenticatorImport')
          }}
        />
      </ActionSheetContent>
    </ActionSheet>
  )
}
