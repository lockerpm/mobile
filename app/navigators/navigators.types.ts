import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import {
  AppNotification,
  LockType,
  LOGIN_METHOD,
  MarketingContent,
  OnPremiseIdentifierData,
  OnPremisePreloginData,
  RelayAddress,
  SubdomainData,
  TrustedContact,
  User2FAPasswordConfig,
  User2FAPincodeConfig,
} from "app/static/types"

import { AndroidAutofillServiceData } from "app/utils/autofillHelper"
import { CipherView } from "core/models/view/cipherView"
import { CollectionView } from "core/models/view/collectionView"
import { SendView } from "core/models/view/sendView"

// ---------------------------ROOT Navigator---------------------------
export type RootParamList = {
  init: undefined
  lock:
    | {
        temporaryLock?: boolean
        type: LockType.Individual
      }
    | {
        temporaryLock?: boolean
        type: LockType.OnPremise
        data: OnPremisePreloginData
        email: string
      }
  unAuthStack: NavigatorScreenParams<UnAuthRoute>
  mainStack: NavigatorScreenParams<AuthRoute>
}

export type RootStackScreenProps<T extends keyof RootParamList> = StackScreenProps<RootParamList, T>

// ---------------------------Login---------------------------

export type LoginRoute = {
  login:
    | {
        initMethod?: LOGIN_METHOD
        email?: string
      }
    | undefined
  loginByPincode: {
    email: string
    // user register by password of not
    havePassword: boolean
  }
  twoFA:
    | {
        type: "password"
        credential: User2FAPasswordConfig
      }
    | {
        type: "pincode"
        credential: User2FAPincodeConfig
      }
}

export type LoginScreenProps<T extends keyof LoginRoute> = CompositeScreenProps<
  StackScreenProps<LoginRoute, T>,
  UnAuthScreenProps<keyof UnAuthRoute>
>
// --------------------------Signup--------------------------

export type SignupRoute = {
  signup: undefined
  signupPinCode: {
    email: string
    getNews: boolean
  }
  signupPassword: {
    email: string
  }
}

export type SignUpScreenProps<T extends keyof SignupRoute> = CompositeScreenProps<
  StackScreenProps<SignupRoute, T>,
  UnAuthScreenProps<keyof UnAuthRoute>
>
// --------------------------SSO--------------------------

export type SSORoute = {
  ssoIdentifier: undefined
  ssoLogin: OnPremiseIdentifierData
}

export type SSOScreenProps<T extends keyof SSORoute> = CompositeScreenProps<
  StackScreenProps<SSORoute, T>,
  UnAuthScreenProps<keyof UnAuthRoute>
>

// --------------------------Forgot password--------------------------
export type ForgotPasswordRoute = {
  methodSelect: undefined
  otp: {
    email: string // for get OTP
    username: string
  }
  changePassword: {
    username: string
    token: string
  }
}

export type ForgotPasswordScreenProps<T extends keyof ForgotPasswordRoute> = CompositeScreenProps<
  StackScreenProps<ForgotPasswordRoute, T>,
  UnAuthScreenProps<keyof UnAuthRoute>
>

// --------------------------Unauth--------------------------

export type UnAuthRoute = {
  intro: undefined
  onBoarding: undefined
  createMasterPassword: undefined
  forgotPasswordStack: NavigatorScreenParams<ForgotPasswordRoute>
  loginStack: NavigatorScreenParams<LoginRoute>
  signupStack: NavigatorScreenParams<SignupRoute>
  ssoStack: NavigatorScreenParams<SSORoute>
}

export type UnAuthScreenProps<T extends keyof UnAuthRoute> = CompositeScreenProps<
  StackScreenProps<UnAuthRoute, T>,
  RootStackScreenProps<keyof RootParamList>
>

// ---------------------------MAIN Navigator---------------------------

export type AuthRoute = {
  marketing: {
    data: MarketingContent
  }
  enterpriseInvited: undefined
  biometricUnlockIntro: undefined

  mainTab: NavigatorScreenParams<TabsRoute>
  toolsStack: NavigatorScreenParams<ToolsRoute>
  menuStack: NavigatorScreenParams<MenuRoute>
  app_list_noti: {
    notifications: AppNotification
  }

  autofill: {
    data: AndroidAutofillServiceData
  }

  dataBreachScanner: undefined
  dataBreachList: undefined
  dataBreachDetail: undefined
  qrScanner: {
    totpCount?: number
    passwordTotp?: boolean
    passwordMode?: "add" | "edit" | "clone"
  }
  passwordGenerator: {
    fromTools?: boolean
  }

  attachment: {
    isShared?: boolean
  }

  authenticator__edit: {
    mode: "add" | "edit"
    passwordTotp?: boolean
    passwordMode?: "add" | "edit" | "clone"
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

  normal_shares: {
    ciphers?: CipherView[]
  }
  quick_shares: {
    cipher: CipherView
  }
  quickShareItemsDetail: {
    send: SendView
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

  shareMultiple: undefined
}

export type AuthStackScreenProps<T extends keyof AuthRoute> = CompositeScreenProps<
  StackScreenProps<AuthRoute, T>,
  RootStackScreenProps<keyof RootParamList>
>

// ---------------------------TABS Navigator---------------------------

export type TabsRoute = {
  homeTab: undefined
  browseTab: undefined
  authenticatorTab: undefined
  toolsTab: undefined
  menuTab: undefined
}
export type TabsScreenProps<T extends keyof TabsRoute> = CompositeScreenProps<
  BottomTabScreenProps<TabsRoute, T>,
  AuthStackScreenProps<keyof AuthRoute>
>

// ---------------------------BROWSE Navigator---------------------------

export type BrowseRoute = {
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

export type BrowseStackScreenProps<T extends keyof BrowseRoute> = CompositeScreenProps<
  StackScreenProps<BrowseRoute, T>,
  AuthStackScreenProps<keyof AuthRoute>
>

// ---------------------------TOOLS---------------------------

export type ToolsRoute = {
  passwordHealth: undefined
  weakPasswordList: undefined
  reusePasswordList: undefined
  exposedPasswordList: undefined
  privateRelay: NavigatorScreenParams<PrivateRelayRoute>
}

export type ToolsStackScreenProps<T extends keyof ToolsRoute> = CompositeScreenProps<
  StackScreenProps<ToolsRoute, T>,
  AuthStackScreenProps<keyof AuthRoute>
>

// ---------------------Private Relay------------------------

export type PrivateRelayRoute = {
  relay: undefined
  manageSubdomain: {
    subdomain: SubdomainData
  }
  aliasStatistic: {
    alias: RelayAddress
  }
  relayInfo: {
    freeAccount: boolean
    data:
      | {
          kind: "email"
          email: string
        }
      | {
          kind: "subdomain"
          subdomain: string
        }
  }
  relayAction: {
    freeAccount: boolean
    item: RelayAddress
    isEditable: boolean
    isEdit: boolean
  }
  editSubdomain: {
    subdomain: SubdomainData
  }
}

export type PrivateRelayScreenProps<T extends keyof PrivateRelayRoute> = StackScreenProps<
  PrivateRelayRoute,
  T
>

// ---------------------------Settings---------------------------

export type MenuRoute = {
  help: undefined
  inviteMember: undefined
  managePlan: undefined
  settingsStack: NavigatorScreenParams<SettingsRoute>
  payment: {
    benefitTab?: 0 | 1 | 2 | 3
    family?: boolean
    premium?: boolean
  }
  welcomePremium: undefined
  referFriend: {
    referLink: string | null
  }
}

export type MenuScreenProps<T extends keyof MenuRoute> = CompositeScreenProps<
  StackScreenProps<MenuRoute, T>,
  AuthStackScreenProps<keyof AuthRoute>
>

// ---------------------------Settings---------------------------

export type SettingsRoute = {
  settings: undefined
  changeMasterPassword: undefined
  autofillService: undefined
  import: undefined
  export: undefined
  emergencyStack: NavigatorScreenParams<EmergencyAccessRoute>
  notiConfigStack: NavigatorScreenParams<NotificationSettingsRoute>
}

export type SettingsScreenProps<T extends keyof SettingsRoute> = CompositeScreenProps<
  StackScreenProps<SettingsRoute, T>,
  MenuScreenProps<keyof MenuRoute>
>

// ------------------------Notification config-----------------------

export type NotificationSettingsRoute = {
  notiOptions: undefined
  deviceNoti: undefined
  emailNoti: undefined
}

export type NotificationSettingsScreenProps<T extends keyof NotificationSettingsRoute> =
  CompositeScreenProps<
    StackScreenProps<NotificationSettingsRoute, T>,
    SettingsScreenProps<keyof SettingsRoute>
  >
// -------------------------Emergency access-------------------------

export type EmergencyAccessRoute = {
  emergencyOptions: undefined
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

export type EmergencyAccessScreenProps<T extends keyof EmergencyAccessRoute> = CompositeScreenProps<
  StackScreenProps<EmergencyAccessRoute, T>,
  SettingsScreenProps<keyof SettingsRoute>
>
