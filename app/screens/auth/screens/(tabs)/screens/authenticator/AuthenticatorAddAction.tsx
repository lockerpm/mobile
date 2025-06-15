import { NewActionSheet, NewActionSheetItem } from "app/components/utils"
import { useAppLocale } from "app/services/context"
import React from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
  navigation?: any
  allItemsLength?: number
  passwordTotp?: boolean
  passwordMode?: "add" | "edit" | "clone"
}

export const AuthenticatorAddAction = (props: Props) => {
  const { translate } = useAppLocale()
  return (
    <NewActionSheet isOpen={props.isOpen} onClose={props.onClose}>
      <NewActionSheetItem
        tx="authenticator.scan_a_qr"
        icon="qr-code"
        onPress={() => {
          props.onClose && props.onClose()
          props.navigation &&
            props.navigation.navigate("qrScanner", {
              totpCount: props.allItemsLength,
              passwordTotp: props.passwordTotp,
              passwordMode: props.passwordMode,
            })
        }}
      />
      <NewActionSheetItem
        tx="authenticator.enter_key"
        icon="keyboard"
        onPress={() => {
          props.onClose && props.onClose()
          props.navigation &&
            props.navigation.navigate("authenticator__edit", {
              passwordTotp: props.passwordTotp,
              passwordMode: props.passwordMode,
            })
        }}
      />
    </NewActionSheet>
  )
}
