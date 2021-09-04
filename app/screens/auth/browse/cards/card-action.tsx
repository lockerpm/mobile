import React from "react"
import { CipherAction } from "../../../../components/cipher/cipher-action/cipher-action"


type Props = {
  isOpen?: boolean,
  onClose?: Function,
  navigation: any
}


export const CardAction = (props: Props) => {
  return (
    <CipherAction {...props}>
    </CipherAction>
  )
}