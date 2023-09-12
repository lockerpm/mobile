import { TxKeyPath } from "app/i18n"
import { ImageSourcePropType, ImageURISource } from "react-native"


type BrowseItem = {
  label: TxKeyPath
  icon: ImageSourcePropType & ImageURISource
  routeName: string
  addable?: boolean
  svgIcon?: any
  group?: string
}

type BrowseItemContainer = {
  [name: string]: BrowseItem
}


export const BROWSE_ITEMS: BrowseItemContainer = {
  folder: {
    label: 'common.folders',
    icon: require('../../../assets/images/icons/vault/folder.png'),
    routeName: 'folders',
  },
  password: {
    label: 'common.passwords',
    icon: require('../../../assets/images/icons/vault/password.png'),
    routeName: 'passwords',
    addable: true
  },
  note: {
    label: 'common.note',
    icon: require('../../../assets/images/icons/vault/note.png'),
    routeName: 'notes',
    addable: true,
  },
  card: {
    label: 'common.card',
    icon: require('../../../assets/images/icons/vault/card.png'),
    routeName: 'cards',
    addable: true
  },
  cryptoWallet: {
    label: 'common.crypto_wallet',
    icon: require('../../../assets/images/icons/vault/crypto-wallet.png'),
    routeName: 'cryptoWallets',
    addable: true
  },
  identity: {
    label: 'common.identity',
    icon: require('../../../assets/images/icons/vault/info.png'),
    routeName: 'identities',
    addable: true,
  },
  shares: {
    label: 'shares.shares',
    icon: require('../../../assets/images/icons/vault/shared.png'),
    routeName: 'shares',
  },
  trash: {
    label: 'common.trash',
    icon: require('../../../assets/images/icons/vault/trash.png'),
    routeName: 'trash',
  },
}

type ToolsItem = {
  label: TxKeyPath,
  desc: TxKeyPath,
  icon: ImageSourcePropType & ImageURISource,
  routeName: string
  svgIcon?: any
  premium?: boolean
}

type ToolsItemContainer = {
  passwordGenerator: ToolsItem,
  authenticator: ToolsItem,
  privateRelay: ToolsItem,
  passwordHealth: ToolsItem,
  dataBreachScanner: ToolsItem
}

export const TOOLS_ITEMS: ToolsItemContainer = {
  passwordGenerator: {
    label: 'pass_generator.title',
    desc: 'pass_generator.desc',
    icon: require('../../../assets/images/icons/vault/password-generator.png'),
    routeName: 'passwordGenerator',
  },
  privateRelay: {
    label: 'private_relay.title',
    desc: 'private_relay.tool',
    icon: require('../../../assets/images/icons/vault/private-relay.png'),
    routeName: 'privateRelay',
  },
  authenticator: {
    label: 'authenticator.title',
    desc: 'authenticator.desc',
    icon: require('../../../assets/images/icons/vault/authenticator.png'),
    routeName: 'authenticator',
  },
  passwordHealth: {
    label: 'pass_health.title',
    desc: 'pass_health.desc',
    icon: require('../../../assets/images/icons/vault/password-health.png'),
    routeName: 'passwordHealth',
    premium: true
  },
  dataBreachScanner: {
    label: 'data_breach_scanner.title',
    desc: 'data_breach_scanner.desc',
    icon: require('../../../assets/images/icons/vault/data-breach-scanner.png'),
    routeName: 'dataBreachScanner',
    premium: true
  }
}

export const FOLDER_IMG = {
  add: {
    img: require('../../../assets/images/icons/vault/folder-add.png'),
  },
  share: {
    img: require('../../../assets/images/icons/vault/folder-share.png'),
  },
  normal: {
    img: require('../../../assets/images/icons/vault/folder.png'),
  }
}

