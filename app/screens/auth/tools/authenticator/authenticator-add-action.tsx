import React from "react"
import { ActionSheet, ActionSheetContent, ActionItem } from "../../../../components"
import { useMixins } from "../../../../services/mixins"

interface Props {
  isOpen?: boolean,
  onClose?: () => void,
  navigation?: any
  allItemsLength?: number
  passwordTotp?: boolean
  passwordMode?: "add" | "edit" | "clone"
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
            props.navigation && props.navigation.navigate('qrScanner', {
              totpCount: props.allItemsLength,
              passwordTotp: props.passwordTotp,
              passwordMode: props.passwordMode
            })
          }}
        />
        <ActionItem
          name={translate('authenticator.enter_key')}
          icon="keyboard-o"
          action={() => {
            props.onClose && props.onClose()
            props.navigation && props.navigation.navigate('authenticator__edit', {
              passwordTotp: props.passwordTotp,
              passwordMode: props.passwordMode
            })
          }}
        />
      </ActionSheetContent>
    </ActionSheet>
  )
}
