import { NavigatorScreenParams } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import { LockType } from "app/screens/unauth/lock/lock.types"
import {
  AppNotification,
  MarketingContent,
  OnPremiseIdentifierData,
  OnPremisePreloginData,
  RelayAddress,
  SubdomainData,
  TrustedContact,
} from "app/static/types"
import { AndroidAutofillServiceData } from "app/utils/autofillHelper"
import { CipherView } from "core/models/view/cipherView"
import { CollectionView } from "core/models/view/collectionView"
import { SendView } from "core/models/view/sendView"

// ---------------------------ROOT Navigator---------------------------
export type RootParamList = {
  init: undefined
  intro: {
    preview?: boolean
  }
  onBoarding: undefined
  lock: {
    temporaryLock?: boolean
    type?: LockType
    // onpremise data
    data?: OnPremisePreloginData
    email?: string
  }
  login: undefined
  forgotPassword: undefined
  signup: undefined
  signup_pin_code: {
    email: string
    getNews: boolean
  }
  signup_password: {
    email: string
  }
  createMasterPassword: undefined
  mainStack: NavigatorScreenParams<PrimaryParamList>

  // vinsso
  ssoIdentifier: undefined
  ssoLogin: OnPremiseIdentifierData
}

export type RootStackScreenProps<T extends keyof RootParamList> = StackScreenProps<RootParamList, T>

// ---------------------------TABS Navigator---------------------------

export type TabsParamList = {
  homeTab: undefined
  browseTab: NavigatorScreenParams<BrowseParamList>
  authenticatorTab: undefined
  toolsTab: undefined
  menuTab: NavigatorScreenParams<MenuParamList>
}

// ---------------------------BROWSE Navigator---------------------------

export type BrowseParamList = {
  browseList: undefined
  folders: undefined
  cards: undefined
  passwords: undefined
  notes: undefined
  identities: undefined
  shares: undefined
  sharedItems: undefined
  quickShareItems: undefined
  quickShareItemsDetail: {
    send: SendView
  }
  shareItems: undefined
  trash: undefined
  cryptoWallets: undefined
}

export type BrowseStackScreenProps<T extends keyof BrowseParamList> = StackScreenProps<
  BrowseParamList,
  T
>
// ---------------------------MENU Navigator---------------------------

export type MenuParamList = {
  menu: undefined
}

// ---------------------------TOOLS Navigator---------------------------

export type ToolsParamList = {
  passwordHealth: undefined
  weakPasswordList: undefined
  reusePasswordList: undefined
  exposedPasswordList: undefined
  privateRelay: undefined
  manageSubdomain: {
    subdomain: SubdomainData
  }
  aliasStatistic: {
    alias: RelayAddress
  }
}

export type ToolsStackScreenProps<T extends keyof ToolsParamList> = StackScreenProps<
  ToolsParamList,
  T
>
// ---------------------------MAIN Navigator---------------------------

export type PrimaryParamList = {
  marketing: {
    data: MarketingContent
  }

  mainTab: {
    screen?: string
  }
  toolsStack: NavigatorScreenParams<ToolsParamList>
  // start: undefined

  enterpriseInvited: undefined
  biometricUnlockIntro: undefined

  passwordGenerator: {
    fromTools?: boolean
  }
  authenticator__edit: {
    mode: "add" | "edit"
    passwordTotp?: boolean
    passwordMode?: "add" | "edit" | "clone"
  }
  qrScanner: {
    totpCount?: number
    passwordTotp?: boolean
    passwordMode?: "add" | "edit" | "clone"
  }
  dataBreachScanner: undefined
  dataBreachList: undefined
  dataBreachDetail: undefined
  countrySelector: undefined

  normal_shares: {
    ciphers?: CipherView[]
  }
  quick_shares: {
    cipher: CipherView
  }
  quickShareItemsDetail: {
    send: SendView
  }

  passwords__info: {
    quickShare?: boolean
  }
  passwords__edit: {
    mode: "add" | "edit" | "clone"
    initialUrl?: string
    collection?: CollectionView
    androidAutofillSavedData?: AndroidAutofillServiceData
  }
  passwords_2fa_setup: {
    mode: "add" | "edit" | "clone"
  }
  passwords_history: undefined

  notes__info: {
    quickShare?: boolean
  }
  notes__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  cards__info: {
    quickShare?: boolean
  }
  cards__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  identities__info: {
    quickShare?: boolean
  }
  identities__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  cryptoWallets__info: {
    quickShare?: boolean
  }
  cryptoWallets__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }

  folders__select: {
    mode: "add" | "move"
    initialId?: string
    cipherIds?: string[]
  }
  folders__ciphers: {
    folderId?: string | null
    collectionId?: string | null
    organizationId?: string | null
  }
  shareFolder: {
    collectionId: string
  }
  manage_plan: undefined
  payment: {
    benefitTab?: 0 | 1 | 2 | 3
    family?: boolean
    premium?: boolean
  }
  refer_friend: {
    referLink: string | null
  }
  invite_member: undefined
  settings: undefined
  changeMasterPassword: undefined
  help: undefined
  autofillService: undefined
  import: undefined
  export: undefined
  autofill: {
    data: AndroidAutofillServiceData
  }
  notificationSettings: undefined
  emailNotiSettings: undefined
  deviceNotiSettings: undefined
  shareMultiple: undefined

  welcome_premium: undefined

  app_list_noti: {
    notifications: AppNotification
  }

  emergencyAccess: undefined
  yourTrustedContact: undefined
  contactsTrustedYou: undefined
  viewEA: {
    trusted: TrustedContact
  }
  takeoverEA: {
    trusted: TrustedContact
    reset_pw: boolean
  }
}

export type AppStackScreenProps<T extends keyof PrimaryParamList> = StackScreenProps<
  PrimaryParamList,
  T
>
