import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import { TxKeyPath } from "app/i18n"
import {
  AppNotification,
  BreanchResult,
  CipherActionsModal,
  CipherAppView,
  LockType,
  LoginOptions,
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
import { CipherType } from "core/enums"
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
  authStack: NavigatorScreenParams<AuthRoute>
}

export type RootStackScreenProps<T extends keyof RootParamList> = StackScreenProps<RootParamList, T>

// ---------------------------Login---------------------------

export type LoginRoute = {
  login:
    | {
        initMethod?: LoginOptions
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
  cipherActionsModal: {
    mode: CipherActionsModal
    item?: CipherAppView

    /**
     * Delete ids for multiple ciphers, if start with CipherActionsModal.DEFAULT
     * it will be item.id
     */
    deleteIds: string[]
  }

  addCipherModal:
    | {
        folderId?: string
        collectionId?: string
      }
    | undefined
  marketingModal: {
    data: MarketingContent
  }
  qrScannerModal: {
    totpCount?: number
    passwordTotp?: boolean
    passwordMode?: "add" | "edit" | "clone"
  }

  autofillAndroid: {
    data: AndroidAutofillServiceData
  }
  mainTab: NavigatorScreenParams<TabsRoute>
  toolsStack: NavigatorScreenParams<ToolsRoute>
  menuStack: NavigatorScreenParams<MenuRoute>
  browseStack: NavigatorScreenParams<BrowseRoute>
  homeStack: NavigatorScreenParams<HomeRoute>
}

export type AuthStackScreenProps<T extends keyof AuthRoute> = CompositeScreenProps<
  StackScreenProps<AuthRoute, T>,
  RootStackScreenProps<keyof RootParamList>
>

// ---------------------------Home Navigator---------------------------

export type HomeRoute = {
  enterpriseInvited: undefined
  biometricUnlockIntro: undefined
  appListNoti: {
    notifications: AppNotification
  }
}

export type HomeStackScreenProps<T extends keyof HomeRoute> = CompositeScreenProps<
  StackScreenProps<HomeRoute, T>,
  AuthStackScreenProps<keyof AuthRoute>
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
  attachment: {
    isShared?: boolean
  }

  cipherList: {
    cipherTypes: CipherType[]
    headerTx?: TxKeyPath
    folderId?: string
    collectionId?: string
  }

  cipherDetail: {
    cipher: CipherAppView

    // If cipher is from quick share
    quickShare?: boolean
  }

  cipherEdit: {
    cipher: CipherAppView
  }

  // --------------- OLDS ---------------

  authenticatorEdit: {
    mode: "add" | "edit"
    passwordTotp?: boolean
    passwordMode?: "add" | "edit" | "clone"
  }
  passwordsInfo: {
    quickShare?: boolean
  }
  passwordsEdit: {
    mode: "add" | "edit" | "clone"
    initialUrl?: string
    collection?: CollectionView
    androidAutofillSavedData?: AndroidAutofillServiceData
  }
  passwords2faSetup: {
    mode: "add" | "edit" | "clone"
  }
  passwordsHistory: undefined

  notesInfo: {
    quickShare?: boolean
  }
  notesEdit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  cardsInfo: {
    quickShare?: boolean
  }
  cardsEdit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  identitiesInfo: {
    quickShare?: boolean
  }
  identitiesEdit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  cryptoWalletsInfo: {
    quickShare?: boolean
  }
  cryptoWalletsEdit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  normalShares: {
    ciphers?: CipherView[]
  }
  quickShares: {
    cipher: CipherView
  }

  foldersSelect: {
    mode: "add" | "move"
    initialId?: string
    cipherIds?: string[]
  }
  foldersCiphers: {
    folderId?: string | null
    collectionId?: string | null
    organizationId?: string | null
  }
  shareFolder: {
    collectionId: string
  }

  shareMultiple: undefined

  folders: undefined
  shares: undefined
  sharedItems: undefined
  quickShareItems: undefined
  quickShareItemsDetail: {
    send: SendView
  }
  shareItems: undefined
  trash: undefined
}

export type BrowseStackScreenProps<T extends keyof BrowseRoute> = CompositeScreenProps<
  StackScreenProps<BrowseRoute, T>,
  AuthStackScreenProps<keyof AuthRoute>
>

// ---------------------------TOOLS---------------------------

export type PasswordHealthRoute = {
  passwordHealth: undefined
  weakPasswordList: undefined
  reusePasswordList: undefined
  exposedPasswordList: undefined
}

export type DataBreachScannerRoute = {
  emailInput: undefined
  dataBreachList: {
    email: string
    data: BreanchResult[]
  }
  dataBreachDetail: {
    data: BreanchResult
  }
}

export type ToolsRoute = {
  passwordGenerator: undefined
  passwordHealthStack: NavigatorScreenParams<PasswordHealthRoute> | undefined
  privateRelayStack: NavigatorScreenParams<PrivateRelayRoute> | undefined
  dataBreachScannerStack: NavigatorScreenParams<DataBreachScannerRoute> | undefined
}

export type ToolsStackScreenProps<T extends keyof ToolsRoute> = CompositeScreenProps<
  StackScreenProps<ToolsRoute, T>,
  AuthStackScreenProps<keyof AuthRoute>
>

export type PasswordHealthStackScreenProps<T extends keyof PasswordHealthRoute> =
  CompositeScreenProps<
    StackScreenProps<PasswordHealthRoute, T>,
    ToolsStackScreenProps<keyof ToolsRoute>
  >

export type DataBreachScannerStackScreenProps<T extends keyof DataBreachScannerRoute> =
  CompositeScreenProps<
    StackScreenProps<DataBreachScannerRoute, T>,
    ToolsStackScreenProps<keyof ToolsRoute>
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
  payment:
    | {
        benefitTab?: 0 | 1 | 2 | 3
        family?: boolean
        premium?: boolean
      }
    | undefined
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
