import { TxKeyPath } from "app/i18n"
import { CipherType } from "core/enums"
import { ImageSourcePropType, ImageURISource } from "react-native"

export const VAULT_LOGO = {
  passwords: require("assets/images/icons/vault/password.png"),
  notes: require("assets/images/icons/vault/note.png"),
  cards: require("assets/images/icons/vault/card.png"),
  cryptoWallets: require("assets/images/icons/vault/crypto-wallet.png"),
  identities: require("assets/images/icons/vault/info.png"),
}

type VaultItem = {
  label: TxKeyPath
  icon: ImageSourcePropType & ImageURISource
  type: CipherType[]
}

export const VAULT_ITEMS: VaultItem[] = [
  {
    label: "common.passwords",
    icon: VAULT_LOGO.passwords,
    type: [CipherType.Login, CipherType.MasterPassword],
  },
  {
    label: "common.note",
    icon: VAULT_LOGO.notes,
    type: [CipherType.SecureNote],
  },
  {
    label: "common.card",
    icon: VAULT_LOGO.cards,
    type: [CipherType.Card],
  },
  {
    label: "common.crypto_wallet",
    icon: VAULT_LOGO.cryptoWallets,
    type: [CipherType.CryptoWallet],
  },
  {
    label: "common.identity",
    icon: VAULT_LOGO.identities,
    type: [CipherType.Identity],
  },
]
