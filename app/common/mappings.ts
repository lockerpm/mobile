import { ImageSourcePropType, ImageURISource } from "react-native"
import { TxKeyPath } from "../i18n"
// ---------------- Svg icons---------------------
import FolderIcon from './images/vault/folder.svg'
import NoteIcon from './images/vault/note.svg'
import IdentityIcon from './images/vault/identity.svg'
import SharedIcon from './images/vault/shared.svg'
import TrashIcon from './images/vault/trash.svg'
import CryptoWalletIcon from './images/vault/crypto-wallet.svg'
import DataBreachScannerIcon from './images/vault/data-breach-scanner.svg'
import PasswordGeneratorIcon from './images/vault/password-generator.svg'
import PrivateRelay from './images/vault/private-relay.svg'
import PasswordHealthIcon from './images/vault/password-health.svg'
import AuthenticatorIcon from './images/vault/authenticator.svg'
import FFolderIcon from './images/folder/folder.svg'
import FFolderShareIcon from './images/folder/folder-share.svg'
import FFolderAddIcon from './images/folder/folder-add.svg'

import DriverLicenseIcon from './images/vault/driver-license.svg'
import CitizenIDIcon from './images/vault/citizen-id.svg'
import PassportIcon from './images/vault/passport.svg'
import SocialSecurituNumberIcon from './images/vault/social-security-number.svg'
import WirelessIcon from './images/vault/wireless-router.svg'
import ServerIcon from './images/vault/server.svg'
import ApiCipherIcon from './images/vault/api-cipher.svg'
import DatabaseIcon from './images/vault/database.svg'

import GitHub from './images/icons/github.svg'
import GitHubLight from './images/icons/github-light.svg'
import Facebook from './images/icons/facebook.svg'
import Google from './images/icons/google.svg'
import Apple from './images/icons/apple.svg'
import AppleLight from './images/icons/apple-light.svg'


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
    icon: require('./images/vault/folder.png'),
    routeName: 'folders',
    svgIcon: FolderIcon
  },
  password: {
    label: 'common.passwords',
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
  cryptoWallet: {
    label: 'common.crypto_wallet',
    icon: require('./images/vault/crypto-wallet.png'),
    routeName: 'cryptoWallets',
    svgIcon: CryptoWalletIcon,
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
  },

  // TODO
  // driverLicense: {
  //   label: 'common.driver_license',
  //   icon: require('./images/vault/driver-license.png'),
  //   routeName: 'driverLicenses',
  //   svgIcon: DriverLicenseIcon,
  //   addable: true
  // },
  // citizenID: {
  //   label: 'common.citizen_id',
  //   icon: require('./images/vault/citizen-id.png'),
  //   routeName: 'citizenIDs',
  //   svgIcon: CitizenIDIcon,
  //   addable: true
  // },
  // socialSecurityNumber: {
  //   label: 'common.social_security_number',
  //   icon: require('./images/vault/social-security-number.png'),
  //   routeName: 'socialSecurityNumbers',
  //   svgIcon: SocialSecurituNumberIcon,
  //   addable: true
  // },
  // wirelessRouter: {
  //   label: 'common.wireless_router',
  //   icon: require('./images/vault/wireless-router.png'),
  //   routeName: 'wirelessRouters',
  //   svgIcon: WirelessIcon,
  //   addable: true
  // },
  // server: {
  //   label: 'common.server',
  //   icon: require('./images/vault/server.png'),
  //   routeName: 'servers',
  //   svgIcon: ServerIcon,
  //   addable: true
  // },
  // passport: {
  //   label: 'common.passport',
  //   icon: require('./images/vault/passport.png'),
  //   routeName: 'passports',
  //   svgIcon: PassportIcon,
  //   addable: true
  // },
  // apiCipher: {
  //   label: 'common.api_cipher',
  //   icon: require('./images/vault/api-cipher.png'),
  //   routeName: 'apiCiphers',
  //   svgIcon: ApiCipherIcon,
  //   addable: true
  // },
  // database: {
  //   label: 'common.database',
  //   icon: require('./images/vault/database.png'),
  //   routeName: 'databases',
  //   svgIcon: DatabaseIcon,
  //   addable: true
  // },
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
    icon: require('./images/vault/password-generator.png'),
    routeName: 'passwordGenerator',
    svgIcon: PasswordGeneratorIcon
  },
  privateRelay: {
    label: 'private_relay.title',
    desc: 'private_relay.tool',
    icon: require('./images/vault/private-relay.png'),
    routeName: 'privateRelay',
    svgIcon: PrivateRelay
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
  google: Google,
  facebook: Facebook,
  github: GitHub,
  githubLight: GitHubLight,
  apple: Apple,
  appleLight: AppleLight
}


export const APP_INTRO = {
  // intro1: require('./images/intro/intro1.png'),
  // intro2: require('./images/intro/intro2.png'),
  // intro3: require('./images/intro/intro3.png'),
  autofill: require('./images/intro/autofill.png'),
  security: require('./images/intro/security.png'),
  sync: require('./images/intro/sync.png'),
  otp: require('./images/intro/otp.png'),
}
