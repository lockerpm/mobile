import React from "react"
import { CipherAction } from "../../../../components"


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