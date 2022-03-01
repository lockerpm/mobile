import { ImageSourcePropType, ImageURISource } from "react-native"
import { TxKeyPath } from "../i18n"

// ---------------- Svg icons---------------------

// @ts-ignore
import FolderIcon from './images/vault/folder.svg'
// @ts-ignore
import NoteIcon from './images/vault/note.svg'
// @ts-ignore
import IdentityIcon from './images/vault/identity.svg'
// @ts-ignore
import SharedIcon from './images/vault/shared.svg'
// @ts-ignore
import TrashIcon from './images/vault/trash.svg'
// @ts-ignore
import DataBreachScannerIcon from './images/vault/data-breach-scanner.svg'
// @ts-ignore
import PasswordGeneratorIcon from './images/vault/password-generator.svg'
// @ts-ignore
import PasswordHealthIcon from './images/vault/password-health.svg'
// @ts-ignore
import AuthenticatorIcon from './images/vault/authenticator.svg'
// @ts-ignore
import FFolderIcon from './images/folder/folder.svg'
// @ts-ignore
import FFolderShareIcon from './images/folder/folder-share.svg'
// @ts-ignore
import FFolderAddIcon from './images/folder/folder-add.svg'


type BrowseItem = {
  label: TxKeyPath,
  icon: ImageSourcePropType & ImageURISource,
  routeName: string,
  addable?: boolean,
  svgIcon?: any
}

type BrowseItemContainer = {
  folder: BrowseItem,
  password: BrowseItem,
  note: BrowseItem,
  card: BrowseItem,
  identity: BrowseItem,
  shares: BrowseItem,
  trash: BrowseItem,
}


export const BROWSE_ITEMS: BrowseItemContainer = {
  folder: {
    label: 'common.folder',
    icon: require('./images/vault/folder.png'),
    routeName: 'folders',
    svgIcon: FolderIcon
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
    addable: true,
    svgIcon: NoteIcon
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
    addable: true,
    svgIcon: IdentityIcon
  },
  shares: {
    label: 'shares.shares',
    icon: require('./images/vault/shared.png'),
    routeName: 'shares',
    svgIcon: SharedIcon
  },
  trash: {
    label: 'common.trash',
    icon: require('./images/vault/trash.png'),
    routeName: 'trash',
    svgIcon: TrashIcon
  }
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
  passwordHealth: ToolsItem,
  dataBreachScanner: ToolsItem
}

export const TOOLS_ITEMS: ToolsItemContainer = {
  passwordGenerator: {
    label: 'pass_generator.title',
    desc: 'pass_generator.desc',
    icon: require('./images/vault/password-generator.png'),
    routeName: 'passwordGenerator',
    svgIcon: PasswordGeneratorIcon
  },
  authenticator: {
    label: 'authenticator.title',
    desc: 'authenticator.desc',
    icon: require('./images/vault/authenticator.png'),
    routeName: 'authenticator',
    svgIcon: AuthenticatorIcon
  },
  passwordHealth: {
    label: 'pass_health.title',
    desc: 'pass_health.desc',
    icon: require('./images/vault/password-health.png'),
    routeName: 'passwordHealth',
    svgIcon: PasswordHealthIcon,
    premium: true
  },
  dataBreachScanner: {
    label: 'data_breach_scanner.title',
    desc: 'data_breach_scanner.desc',
    icon: require('./images/vault/data-breach-scanner.png'),
    routeName: 'dataBreachScanner',
    svgIcon: DataBreachScannerIcon,
    premium: true
  }
}

export const FOLDER_IMG = {
  add: {
    img: require('./images/folder/folder-add.png'),
    svg: FFolderAddIcon
  },
  share: {
    img: require('./images/folder/folder-share.png'),
    svg: FFolderShareIcon
  },
  normal: {
    img: require('./images/folder/folder.png'),
    svg: FFolderIcon
  }
}

export const APP_ICON = {
  icon: require('./images/appIcon/locker.png'),
  iconDark: require('./images/appIcon/locker-dark.png'),
  textVertical: require('./images/appIcon/textVertical.png'),
  textHorizontal: require('./images/appIcon/textHorizontal.png'),
  textVerticalLight: require('./images/appIcon/textVertical-light.png'),
  textHorizontalLight: require('./images/appIcon/textHorizontal-light.png')
}


export const SOCIAL_LOGIN_ICON = {
  google: require('./images/icons/google.png'),
  facebook: require('./images/icons/facebook.png'),
  github: require('./images/icons/github.png'),
  githubLight: require('./images/icons/github-light.png')
}
