import { ImageIconTypes } from 'app/components/cores'
import { TxKeyPath } from 'app/i18n'
import { ImageSourcePropType, ImageURISource } from 'react-native'

// ---------------------------BROWSE---------------------------

export type BrowseItem = {
  label: TxKeyPath
  icon: ImageSourcePropType & ImageURISource
  routeName: string
  addable?: boolean
  group?: string
}

type BrowseItemContainer = {
  [name: string]: BrowseItem
}

export const BROWSE_ITEMS: BrowseItemContainer = {
  folder: {
    label: 'common.folders',
    icon: require('assets/images/icons/vault/folder.png'),
    routeName: 'folders',
  },
  password: {
    label: 'common.passwords',
    icon: require('assets/images/icons/vault/password.png'),
    routeName: 'passwords',
    addable: true,
  },
  note: {
    label: 'common.note',
    icon: require('assets/images/icons/vault/note.png'),
    routeName: 'notes',
    addable: true,
  },
  card: {
    label: 'common.card',
    icon: require('assets/images/icons/vault/card.png'),
    routeName: 'cards',
    addable: true,
  },
  cryptoWallet: {
    label: 'common.crypto_wallet',
    icon: require('assets/images/icons/vault/crypto-wallet.png'),
    routeName: 'cryptoWallets',
    addable: true,
  },
  identity: {
    label: 'common.identity',
    icon: require('assets/images/icons/vault/info.png'),
    routeName: 'identities',
    addable: true,
  },
  shares: {
    label: 'shares.shares',
    icon: require('assets/images/icons/vault/shared.png'),
    routeName: 'shares',
  },
  trash: {
    label: 'common.trash',
    icon: require('assets/images/icons/vault/trash.png'),
    routeName: 'trash',
  },
}

// ------------------------TOOLS list screen routing---------------------
export type ToolsItem = {
  label: TxKeyPath
  desc: TxKeyPath
  icon: ImageIconTypes
  routeName: string
  premium?: boolean
}

type ToolsItemContainer = {
  passwordGenerator: ToolsItem
  authenticator: ToolsItem
  privateRelay: ToolsItem
  passwordHealth: ToolsItem
  dataBreachScanner: ToolsItem
}

export const TOOLS_ITEMS: ToolsItemContainer = {
  passwordGenerator: {
    label: 'pass_generator.title',
    desc: 'pass_generator.desc',
    icon: 'password-generator',
    routeName: 'passwordGenerator',
  },
  privateRelay: {
    label: 'private_relay.title',
    desc: 'private_relay.tool',
    icon: 'private-relay',
    routeName: 'privateRelay',
  },
  authenticator: {
    label: 'authenticator.title',
    desc: 'authenticator.desc',
    icon: 'authenticator',
    routeName: 'authenticator',
  },
  passwordHealth: {
    label: 'pass_health.title',
    desc: 'pass_health.desc',
    icon: 'password-health',
    routeName: 'passwordHealth',
    premium: true,
  },
  dataBreachScanner: {
    label: 'data_breach_scanner.title',
    desc: 'data_breach_scanner.desc',
    icon: 'data-breach-scanner',
    routeName: 'dataBreachScanner',
    premium: true,
  },
}
