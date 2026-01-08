import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

import { TxKeyPath } from "app/i18n"
import {
  AccountRoleText,
  AppNotification,
  BreanchResult,
  CipherActionsModal,
  CipherAppView,
  CipherEditHelperModal,
  CipherEditMode,
  FamilyMember,
  FolderActionsModal,
  LockType,
  LoginOptions,
  MarketingContent,
  OnPremiseIdentifierData,
  OnPremisePreloginData,
  RelayAddress,
  ScamLookupResult,
  SharedGroupType,
  SharedMemberType,
  SharedWithYouType,
  SubdomainData,
  TrustedContact,
  User2FAPasswordConfig,
  User2FAPincodeConfig,
} from "app/static/types"
import { CipherType } from "core/enums"
import { CollectionView } from "core/models/view/collectionView"
import { FolderView } from "core/models/view/folderView"
import { SendView } from "core/models/view/sendView"

import {
  AndroidAFCreatePasskey,
  AndroidAFGetPasskey,
  AndroidAppProps,
} from "@/utils/autofill.android"

// ---------------------------ROOT Navigator---------------------------
export type AppRoute = {
  init: {
    fido2?: AndroidAppProps
  }
  lock:
    | {
        temporaryLock?: boolean
        type: LockType.Individual
        fido2?: AndroidAppProps

        // otpauth uri label from deeplink
        label?: string
      }
    | {
        temporaryLock?: boolean
        type: LockType.OnPremise
        data: OnPremisePreloginData
        email: string

        // otpauth uri label from deeplink
        label?: string
      }
  unAuthStack: NavigatorScreenParams<UnAuthRoute>
  authStack: NavigatorScreenParams<AuthRoute> & {
    fido2?: AndroidAppProps
  }
}

export type AppScreenProps<T extends keyof AppRoute> = NativeStackScreenProps<AppRoute, T>

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
    havePassword?: boolean

    // deeplink
    code_otp?: string
    nonce?: string

    // Sign up
    fromSignup?: boolean
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
  NativeStackScreenProps<LoginRoute, T>,
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
  NativeStackScreenProps<SignupRoute, T>,
  UnAuthScreenProps<keyof UnAuthRoute>
>
// --------------------------SSO--------------------------

export type SSORoute = {
  ssoIdentifier: undefined
  ssoLogin: OnPremiseIdentifierData
}

export type SSOScreenProps<T extends keyof SSORoute> = CompositeScreenProps<
  NativeStackScreenProps<SSORoute, T>,
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
  NativeStackScreenProps<ForgotPasswordRoute, T>,
  UnAuthScreenProps<keyof UnAuthRoute>
>

// --------------------------Unauth--------------------------

export type UnAuthRoute = {
  intro: undefined
  activateAccount: {
    token: string
  }
  onBoarding: undefined
  createMasterPassword: undefined
  forgotPasswordStack: NavigatorScreenParams<ForgotPasswordRoute>
  loginStack: NavigatorScreenParams<LoginRoute>
  signupStack: NavigatorScreenParams<SignupRoute>
  ssoStack: NavigatorScreenParams<SSORoute>
}

export type UnAuthScreenProps<T extends keyof UnAuthRoute> = CompositeScreenProps<
  NativeStackScreenProps<UnAuthRoute, T>,
  AppScreenProps<keyof AppRoute>
>

// ---------------------------MAIN Navigator---------------------------

export type AndroidAutofillRoute = {
  passwordList: {
    data: AndroidAppProps
  }
  passwordActionsModal: {
    item: CipherAppView
  }
  createPasskey: {
    data: AndroidAFCreatePasskey
  }
  passkeyList: {
    data: AndroidAFGetPasskey
  }
  passwordGenModal: undefined
}

export type AuthRoute = {
  cipherActionsModal: {
    mode: CipherActionsModal
    item?: CipherAppView

    /**
     * Delete ids for multiple ciphers, if start with CipherActionsModal.DEFAULT
     * it will be item.id
     */
    deleteIds: string[]

    /**
     * Permanent delete, only use in Trash screen
     */
    isDeleted?: boolean
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

  qrScannerModal: undefined

  androidAutofillStack: NavigatorScreenParams<AndroidAutofillRoute> & {
    fido2: AndroidAppProps
  }
  mainTab: NavigatorScreenParams<TabsRoute>
  toolsStack: NavigatorScreenParams<ToolsRoute>
  menuStack: NavigatorScreenParams<MenuRoute>
  browseStack: NavigatorScreenParams<BrowseRoute>
  homeStack: NavigatorScreenParams<HomeRoute>
}

export type AuthScreenProps<T extends keyof AuthRoute> = CompositeScreenProps<
  NativeStackScreenProps<AuthRoute, T>,
  AppScreenProps<keyof AppRoute>
>

export type AndroidAutofillScreenProps<T extends keyof AndroidAutofillRoute> = CompositeScreenProps<
  NativeStackScreenProps<AndroidAutofillRoute, T>,
  AuthScreenProps<keyof AuthRoute>
>

// ---------------------------Home Navigator---------------------------

export type HomeRoute = {
  enterpriseInvited: undefined
  biometricUnlockIntro: undefined
  appListNoti: {
    notifications: AppNotification
  }
}

export type HomeScreenProps<T extends keyof HomeRoute> = CompositeScreenProps<
  NativeStackScreenProps<HomeRoute, T>,
  AuthScreenProps<keyof AuthRoute>
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
  AuthScreenProps<keyof AuthRoute>
>

// ---------------------------BROWSE Navigator---------------------------

export type ShareRoute = {
  confirmYourShareModal: {
    organizationId: string
    member: SharedMemberType
  }
  pendingSharedCipherModal: {
    cipher: SharedWithYouType
  }
  quickSharesActionsModal: {
    cipher: SendView
  }
  sharesHome: undefined
  yourShareCipherList: undefined
  sharedWithYouCipherList: undefined
  quickShareCipherList: undefined
  quickShareCipherDetail: {
    send: SendView
  }
  quickShares: {
    cipher: CipherAppView
  }
  quickSharesSelectCipher: undefined

  normalShare: {
    ciphers: CipherAppView[]
  }
  manageSharedMember: {
    cipher: CipherAppView
    isFromShare?: boolean
  }
  manageSharedMemberModal: {
    member?: SharedMemberType
    group?: SharedGroupType
    cipher: CipherAppView
  }
  editShareMemberPermissionModal: {
    id: string
    value: string
    role: AccountRoleText
  }

  folderShare: {
    folder: FolderView | CollectionView
  }
  manageFolderSharedMember: {
    collection: CollectionView
    isFromShare?: boolean
  }
  manageFolderSharedMemberModal: {
    member?: SharedMemberType
    group?: SharedGroupType
    collection: CollectionView
  }
}

export type BrowseRoute = {
  folderActionModal: {
    mode: FolderActionsModal

    folder?: FolderView
    collection?: CollectionView
  }

  cipherEditHelperModal: {
    mode: CipherEditHelperModal
  }

  attachment: {
    cipher: CipherAppView
    // open attachmet screen from shared cipher or not
    isShared?: boolean
  }

  cipherList: {
    cipherTypes?: CipherType[]

    // cipherList header
    header?: string
    headerTx?: TxKeyPath

    // Open from folder item in FolderList
    folderId?: string

    // Open from collection item in FolderList
    collectionId?: string
    organizationId?: string

    // Deleted cipher (trash screen)
    isDeleted?: boolean
  }

  cipherDetail: {
    cipher: CipherAppView

    // If cipher is from quick share
    quickShare?: boolean
  }

  cipherEdit: {
    // mode: "add" | "edit" | "clone"
    mode: CipherEditMode

    // cipher type to add or edit
    cipherType: CipherType

    // cipher to edit, if mode is "edit" or "clone"
    cipher?: CipherAppView

    // add cipher from Collection Ciphers view
    initCollectionIds?: string[]

    // add cipher from Folder Ciphers view
    initFolderId?: string

    // add password from android Autofill Service
    initialUrl?: string // app domain
    androidAutofillSavedData?: AndroidAppProps

    // otp qrscan uri
    otpUri?: string
  }

  folderList: undefined
  folderSelect: {
    // mode === "add": navigate from cipher edit screen
    // mode === "move": navigate from cipher list when user want  move ciphers to folder
    mode: "add" | "move"
    initialId?: string
    cipherIds?: string[]
  }
  otpSelect: {
    selectedOtp: string
  }
  shareStack: NavigatorScreenParams<ShareRoute>
  passwordsHistory: {
    cipher: CipherAppView
  }
}

export type BrowseScreenProps<T extends keyof BrowseRoute> = CompositeScreenProps<
  NativeStackScreenProps<BrowseRoute, T>,
  AuthScreenProps<keyof AuthRoute>
>

export type ShareScreenProps<T extends keyof ShareRoute> = CompositeScreenProps<
  NativeStackScreenProps<ShareRoute, T>,
  BrowseScreenProps<keyof BrowseRoute>
>

// ---------------------------TOOLS---------------------------

export type ScamRoute = {
  scamList: undefined
  lookup: undefined
  lookupResult: {
    data: ScamLookupResult
  }
  myReportList: undefined
  report: {
    phoneNumber?: string
  }
}

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
  scamStack: NavigatorScreenParams<ScamRoute> | undefined
}

export type ToolsScreenProps<T extends keyof ToolsRoute> = CompositeScreenProps<
  NativeStackScreenProps<ToolsRoute, T>,
  AuthScreenProps<keyof AuthRoute>
>

export type PasswordHealthScreenProps<T extends keyof PasswordHealthRoute> = CompositeScreenProps<
  NativeStackScreenProps<PasswordHealthRoute, T>,
  ToolsScreenProps<keyof ToolsRoute>
>

export type DataBreachScannerScreenProps<T extends keyof DataBreachScannerRoute> =
  CompositeScreenProps<
    NativeStackScreenProps<DataBreachScannerRoute, T>,
    ToolsScreenProps<keyof ToolsRoute>
  >

export type ScamScreenProps<T extends keyof ScamRoute> = CompositeScreenProps<
  NativeStackScreenProps<ScamRoute, T>,
  ToolsScreenProps<keyof ToolsRoute>
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
  createSubdomain: undefined
}

export type PrivateRelayScreenProps<T extends keyof PrivateRelayRoute> = NativeStackScreenProps<
  PrivateRelayRoute,
  T
>

// ---------------------------Settings---------------------------

export type MenuRoute = {
  help: undefined
  inviteToFamilyStack: NavigatorScreenParams<InviteToFamilyRoute>
  settingsStack: NavigatorScreenParams<SettingsRoute>
  payment:
    | {
        benefitTab?: 0 | 1 | 2 | 3
        family?: boolean
        premium?: boolean
      }
    | undefined
  welcomePremium: undefined
  referFriend: undefined
}

export type MenuScreenProps<T extends keyof MenuRoute> = CompositeScreenProps<
  NativeStackScreenProps<MenuRoute, T>,
  AuthScreenProps<keyof AuthRoute>
>

// ---------------------------Invite to family---------------------------

export type InviteToFamilyRoute = {
  manageMember: undefined
  inviteMember: {
    limit: number
    familyMembers: FamilyMember[]
  }
  deleteMember: {
    id: number
    email: string
    avatar?: string
  }
}

export type InviteToFamilyScreenProps<T extends keyof InviteToFamilyRoute> = CompositeScreenProps<
  NativeStackScreenProps<InviteToFamilyRoute, T>,
  MenuScreenProps<keyof MenuRoute>
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
  NativeStackScreenProps<SettingsRoute, T>,
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
    NativeStackScreenProps<NotificationSettingsRoute, T>,
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
  NativeStackScreenProps<EmergencyAccessRoute, T>,
  SettingsScreenProps<keyof SettingsRoute>
>
