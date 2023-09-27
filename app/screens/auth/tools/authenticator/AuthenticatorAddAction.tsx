import { ActionItem, ActionSheet } from 'app/components-v2/ciphers'
import { translate } from 'app/i18n'
import React from 'react'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  navigation?: any
  allItemsLength?: number
  passwordTotp?: boolean
  passwordMode?: 'add' | 'edit' | 'clone'
}

export const AuthenticatorAddAction = (props: Props) => {
  return (
    <ActionSheet isOpen={props.isOpen} onClose={props.onClose}>
      <ActionItem
        name={translate('authenticator.scan_a_qr')}
        icon="qr-code"
        action={() => {
          props.onClose && props.onClose()
          props.navigation &&
            props.navigation.navigate('qrScanner', {
              totpCount: props.allItemsLength,
              passwordTotp: props.passwordTotp,
              passwordMode: props.passwordMode,
            })
        }}
      />
      <ActionItem
        name={translate('authenticator.enter_key')}
        icon="keyboard"
        action={() => {
          props.onClose && props.onClose()
          props.navigation &&
            props.navigation.navigate('authenticator__edit', {
              passwordTotp: props.passwordTotp,
              passwordMode: props.passwordMode,
            })
        }}
      />
    </ActionSheet>
  )
}
