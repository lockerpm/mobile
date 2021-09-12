import { ImageSourcePropType, ImageURISource } from "react-native"
import { TxKeyPath } from "../i18n"

type BrowseItem = {
  label: TxKeyPath,
  icon: ImageSourcePropType & ImageURISource,
  routeName: string,
  addable?: boolean
}

type BrowseItemContainer = {
  folder: BrowseItem,
  password: BrowseItem,
  note: BrowseItem,
  card: BrowseItem,
  identity: BrowseItem,
  shared: BrowseItem,
  trash: BrowseItem,
}


export const BROWSE_ITEMS: BrowseItemContainer = {
  folder: {
    label: 'common.folder',
    icon: require('./images/vault/folder.png'),
    routeName: 'folders'
  },
  password: {
    label: 'common.password',
    icon: require('./images/vault/password.png'),
    routeName: 'passwords',
    addable: true
  },
  note: {
    label: 'common.note',
    icon: require('./images/vault/note.png'),
    routeName: 'notes',
    addable: true
  },
  card: {
    label: 'common.card',
    icon: require('./images/vault/card.png'),
    routeName: 'cards',
    addable: true
  },
  identity: {
    label: 'common.identity',
    icon: require('./images/vault/info.png'),
    routeName: 'identities',
    addable: true
  },
  shared: {
    label: 'shares.share_items',
    icon: require('./images/vault/shared.png'),
    routeName: 'shares'
  },
  trash: {
    label: 'common.trash',
    icon: require('./images/vault/trash.png'),
    routeName: 'trash'
  }
}

type ToolsItem = {
  label: TxKeyPath,
  desc: TxKeyPath,
  icon: ImageSourcePropType & ImageURISource,
  routeName: string
}

type ToolsItemContainer = {
  passwordGenerator: ToolsItem,
  passwordHealth: ToolsItem,
  dataBreachScanner: ToolsItem
}

export const TOOLS_ITEMS: ToolsItemContainer = {
  passwordGenerator: {
    label: 'pass_generator.title',
    desc: 'pass_generator.desc',
    icon: require('./images/vault/password-generator.png'),
    routeName: 'passwordGenerator'
  },
  passwordHealth: {
    label: 'pass_health.title',
    desc: 'pass_health.desc',
    icon: require('./images/vault/password-health.png'),
    routeName: 'passwordHealth'
  },
  dataBreachScanner: {
    label: 'data_breach_scanner.title',
    desc: 'data_breach_scanner.desc',
    icon: require('./images/vault/data-breach-scanner.png'),
    routeName: 'dataBreachScanner'
  }
}

export const FOLDER_IMG = {
  add: {
    img: require('./images/folder/folder-add.png')
  },
  share: {
    img: require('./images/folder/folder-share.png')
  },
  normal: {
    img: require('./images/folder/folder.png')
  }
}
