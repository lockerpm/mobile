import { View } from "react-native"

import { CipherAppView } from "app/static/types"
import { CipherType } from "core/enums"

import { CardActions } from "./CardActions"
import { CryptoWalletActions } from "./CryptoActions"
import { IdentityAction } from "./IdentitiesActions"
import { NoteAction } from "./NoteActions"
import { PasswordAction } from "./PasswordActions"

type Props = {
  item: CipherAppView
  onClose: () => void
}

export const CipherActionsByType = (props: Props) => {
  switch (props.item.type) {
    case CipherType.MasterPassword:
    case CipherType.Login:
      return <PasswordAction {...props} />
    case CipherType.SecureNote:
      return <NoteAction {...props} />
    case CipherType.Card:
      return <CardActions {...props} />
    case CipherType.CryptoWallet:
      return <CryptoWalletActions {...props} />
    case CipherType.Identity:
      return <IdentityAction {...props} />
    case CipherType.TOTP:
      return <View />
    default:
      return <View />
  }
}
