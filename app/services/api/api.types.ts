import { GeneralApiProblem } from "./api-problem"
import { UserSnapshot } from "../../models/user/user"
import { DeviceType } from "../../../core/enums"
import { SyncResponse } from "../../../core/models/response/syncResponse"
import { FolderResponse } from "../../../core/models/response/folderResponse"
import { CollectionResponse } from "../../../core/models/response/collectionResponse"
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { FolderRequest } from "../../../core/models/request/folderRequest"
import { CipherResponse } from "../../../core/models/response/cipherResponse"
import {
  AccountRole,
  AccountRoleText,
  EnterpriseGroupRoleText,
  EnterpriseInvitationStatus,
  InvitationStatus,
  NotificationCategory,
} from "../../config/types"
import { ProfileResponse } from "../../../core/models/response/profileResponse"
import { ProfileOrganizationResponse } from "../../../core/models/response/profileOrganizationResponse"
import {
  MyShareType,
  TeamPolicies,
  RelayAddress,
  SessionSnapshot,
  SharingInvitationType,
  TrustedContact,
  UserTeam,
  PasswordPolicy,
  MasterPasswordPolicy,
  BlockFailedLoginPolicy,
  PasswordlessPolicy,
  SubdomainData,
  Enterprise,
} from "../../config/types/api"
import { PasskeyAuthenticationResult, PasskeyRegistrationResult } from "react-native-passkey"

// ------------------ Response ------------------------

export type WebAuthListCredentialsResult =
  | {
      kind: "ok"
      data: WebauthCredential[]
    }
  | GeneralApiProblem

export type LoginMethodResult =
  | {
      kind: "ok"
      data: {
        webauthn: boolean
        is_random_password: boolean
      }
    }
  | GeneralApiProblem

export type LoginResult =
  | {
      kind: "ok"
      data: {
        token?: string
        is_factor2?: boolean
        methods?: {
          type: string
          data: any
        }[]
      }
    }
  | GeneralApiProblem

export type GetPMTokenResult =
  | {
      kind: "ok"
      data: {
        url: string
        access_token: string

        // Clone data here to hide error
        // These data actually not exists
        is_factor2?: boolean
        methods?: {
          type: string
          data: any
        }[]
      }
    }
  | GeneralApiProblem

export type SocialLoginResult =
  | {
      kind: "ok"
      data: {
        is_first?: boolean
        new_user?: boolean
        token: string
        tmp_token?: string
      }
    }
  | GeneralApiProblem

export type AccountRecoveryResult =
  | {
      kind: "ok"
      data: {
        type: string
        data: any
      }[]
    }
  | GeneralApiProblem

export type SessionLoginResult = { kind: "ok"; data: SessionSnapshot } | GeneralApiProblem
export type GetUserResult = { kind: "ok"; user: UserSnapshot } | GeneralApiProblem
export type GetEnterpriseResult = { kind: "ok"; data: Enterprise[] } | GeneralApiProblem
export type EmptyResult = { kind: "ok" } | GeneralApiProblem
export type BooleanResult = { kind: "ok"; data: boolean } | GeneralApiProblem
export type SyncResult =
  | { kind: "ok"; data: SyncResponse & { count?: { ciphers: number } } }
  | GeneralApiProblem
export type GetCipherResult = { kind: "ok"; data: CipherResponse } | GeneralApiProblem
export type GetFolderResult = { kind: "ok"; data: FolderResponse } | GeneralApiProblem
export type GetOrganizationResult =
  | { kind: "ok"; data: ProfileOrganizationResponse }
  | GeneralApiProblem
export type SyncQuickSharesResult = { kind: "ok"; data: any[] } | GeneralApiProblem
export type QuickSharesResult =
  | {
      kind: "ok"
      data: {
        id: string
        cipher_id: string
        access_id: string
      }
    }
  | GeneralApiProblem
export type PostFolderResult = { kind: "ok"; data: FolderResponse } | GeneralApiProblem
export type PostCollectionResult = { kind: "ok"; data: CollectionResponse } | GeneralApiProblem
export type GetProfileResult = { kind: "ok"; data: ProfileResponse } | GeneralApiProblem
export type GetTeamsResult = { kind: "ok"; teams: UserTeam[] } | GeneralApiProblem

export type GetPlanResult =
  | {
      kind: "ok"
      data: {
        name: string
        alias: string
        is_family: boolean
        cancel_at_period_end: boolean
        duration: "monthly" | "yearly"
        next_billing_time: number
        payment_method: string
      }
    }
  | GeneralApiProblem

export type EmailOtpResult = { kind: "ok"; success: boolean } | GeneralApiProblem
export type ResetPasswordResult = { kind: "ok"; success: boolean } | GeneralApiProblem

export type ResetPasswordWithCodeResult =
  | {
      kind: "ok"
      data: {
        reset_password_url: string
      }
    }
  | GeneralApiProblem

export type PurchaseValidationResult =
  | {
      kind: "ok"
      data: {
        success: boolean
        detail: string
      }
    }
  | GeneralApiProblem

export type FamilyMemberResult =
  | {
      kind: "ok"
      data: {
        id: number
        email: string
        avatar?: string
        created_time?: string
        username?: string
        full_name?: string
      }[]
    }
  | GeneralApiProblem

export type AddMemberResult = { kind: "ok"; data: any } | GeneralApiProblem
export type RemoveMemberResult = { kind: "ok" } | GeneralApiProblem
export type GetReferLinkResult = { kind: "ok"; data: { referral_link: string } } | GeneralApiProblem

export type GetTrialEligibleResult =
  | {
      kind: "ok"
      data: {
        personal_trial_applied: boolean
      }
    }
  | GeneralApiProblem

export type GetNotificationSettings =
  | { kind: "ok"; data: NotificationSettingData[] }
  | GeneralApiProblem
export type UpdateNotiSettingsResult = { kind: "ok" } | GeneralApiProblem
export type FetchInappNotiResult = { kind: "ok"; data: AppNotification } | GeneralApiProblem

export type BillingResult =
  | {
      kind: "ok"
      data: {
        id: number
        created_time: number
        currency: "VNP" | "USD"
        description: string
        discount: number
        duration: "monthly" | "yearly"
        failure_reason?: string
        payment_id: string
        payment_method: string
        plan: string
        status: string
        total_price: number
        transaction_type: string
      }[]
    }
  | GeneralApiProblem

export type GetInvitationsResult =
  | {
      kind: "ok"
      data: {
        access_time: number
        id: string
        role: AccountRoleText
        status: InvitationStatus
        team: {
          id: string
          name: string
          organization_id: string
        }
      }[]
    }
  | GeneralApiProblem

export type CheckBreachResult =
  | {
      kind: "ok"
      data: {
        added_date: string
        breach_date: string
        data_clases: string[]
        description: string
        domain: string
        is_fabricated: boolean
        is_retired: boolean
        is_sensitive: boolean
        is_spam_list: boolean
        is_verified: boolean
        logo_path: string
        modified_date: string
        name: string
        pwn_count: number
        title: string
      }[]
    }
  | GeneralApiProblem

export type GetTeamPoliciesResult = { kind: "ok"; data: TeamPolicies } | GeneralApiProblem
export type GetTeamPolicyResult =
  | {
      kind: "ok"
      data: PasswordPolicy | MasterPasswordPolicy | BlockFailedLoginPolicy | PasswordlessPolicy
    }
  | GeneralApiProblem

export type GetLastUpdateResult =
  | { kind: "ok"; data: { revision_date: number } }
  | GeneralApiProblem

export type GetSharingPublicKeyResult =
  | { kind: "ok"; data: { public_key: string } }
  | GeneralApiProblem
// TODO
export type ShareFolderResult = { kind: "ok"; data: { id: string } } | GeneralApiProblem
export type ShareCipherResult =
  | {
      kind: "ok"
      data: {
        id: string // organizationId
      }
    }
  | GeneralApiProblem

export type QuickShareCipherResult =
  | {
      kind: "ok"
      data: {
        access_id: String
        cipher_id: string
        id: string
      }
    }
  | GeneralApiProblem

export type GetShareInvitationsResult =
  | { kind: "ok"; data: SharingInvitationType[] }
  | GeneralApiProblem
export type GetMySharesResult = { kind: "ok"; data: MyShareType[] } | GeneralApiProblem
export type PostCipherResult = { kind: "ok"; data: { id: string } } | GeneralApiProblem
export type ImportFolderResult = { kind: "ok"; data: { ids: string[] } } | GeneralApiProblem
export type FetchOfferDetailsResult =
  | {
      kind: "ok"
      data: {
        nonce: string
        timestamp: number
        key_identifier: string
        sig: string
      }
    }
  | GeneralApiProblem

export type FetchRelayListAddressesResult =
  | {
      kind: "ok"
      data: {
        count: number
        next: string | null
        previous: string | null
        results: RelayAddress[]
      }
    }
  | GeneralApiProblem
export type CreateRelaySubdomainResult =
  | {
      kind: "ok"
      data: SubdomainData
    }
  | GeneralApiProblem
export type FetchRelayListSubdomainResult =
  | {
      kind: "ok"
      data: SubdomainData[]
    }
  | GeneralApiProblem
export type GenerateRelayNewAddressResult = { kind: "ok"; data: RelayAddress } | GeneralApiProblem
export type TrustedResult = { kind: "ok"; data: TrustedContact[] } | GeneralApiProblem
export type EAInviteResult = { kind: "ok"; data: { is: string } } | GeneralApiProblem
export type EATakeoverResult =
  | {
      kind: "ok"
      data: {
        kdf: number
        kdf_iterations: number
        key_encrypted: string
      }
    }
  | GeneralApiProblem
export type EAViewResult =
  | {
      kind: "ok"
      data: {
        ciphers: CipherResponse[]
        key_encrypted: string
      }
    }
  | GeneralApiProblem

export type EnterpriseGroupsResult = { kind: "ok"; data: GroupData[] } | GeneralApiProblem
export type EnterpriseGroupsMemebersResult =
  | { kind: "ok"; data: GroupData & { members: GroupMemberData[] } }
  | GeneralApiProblem
export type EnterpriseSearchGroupResult =
  | {
      kind: "ok"
      data: {
        groups: GroupData[]
        members: GroupMemberData[]
      }
    }
  | GeneralApiProblem
export type EnterpriseInvitationResult =
  | {
      kind: "ok"
      data: EnterpriseInvitation[]
    }
  | GeneralApiProblem

export type OnPremisePreLoginResult =
  | {
      kind: "ok"
      data: OnPremisePreloginData[]
    }
  | GeneralApiProblem

export type OnPremiseIdentifierResult =
  | {
      kind: "ok"
      data: OnPremiseIdentifierData
    }
  | GeneralApiProblem

export type BusinessLoginMethodResult =
  | {
      kind: "ok"
      data: {
        login_method: "password" | "passwordless"
      }
    }
  | GeneralApiProblem

// ---------------- data --------------------

export type OnPremisePreloginData = {
  activated: boolean
  alias: string
  avatar: string
  base_api: string
  login_method: "password" | "passwordless" | string
  email: string
  require_passwordless: boolean
  set_up_passwordless: boolean
}

export type OnPremiseIdentifierData = {
  host: string
  use_sso: boolean
  identifier: string
}
export type NotificationSettingData = {
  category: {
    id: NotificationCategory
    mail: boolean
    name: string
    notification: boolean
  }
  mail: boolean
  notification: boolean
}

export type LoginData = {
  username: string
  password: string
  method?: string
  otp?: string
  save_device?: boolean
}

export type AuthPasskeyData = {
  username: string,
  response: PasskeyAuthenticationResult
}
export type GetPMTokenData = {
  SERVICE_URL: "/"
  SERVICE_SCOPE: "pwdmanager"
  CLIENT: "mobile"
}

export type RegisterData = {
  email: string
  password: string
  confirm_password: string
  full_name: string
  country: string
  phone?: string
  keep_me_updated?: boolean
  request_code: string
  scope: string
  utm_source?: string
}


export type RegisterPasskeyOptionData = {
  algorithms: string[]
  email: string
  full_name: string
}

export type RegisterPasskeyData = RegisterData & {
  response: PasskeyRegistrationResult & {
    authenticatorAttachment: string
  }
}

export type SocialLoginData = {
  provider: string
  access_token?: string
  code?: string
  scope?: string
  utm_source?: string
}

export type SessionLoginData = {
  client_id: "mobile"
  password: string
  device_name: string
  device_type: DeviceType
  device_identifier: string
  email: string
}

export type SessionOtpLoginData = {
  method: string
  otp: string
  save_device: boolean
} & SessionLoginData

export type RegisterLockerData = {
  name: string
  email: string
  master_password_hash: string
  master_password_hint: string
  key: string
  kdf: number
  kdf_iterations: number
  reference_data: string
  keys: {
    public_key: string
    encrypted_private_key: string
  }
  score: number
}

export type ChangePasswordData = {
  key: string
  new_master_password_hash: string
  master_password_hash: string
  master_password_cipher: CipherRequest
  new_master_password_hint: string
}

export type PasswordHintRequestData = {
  email: string
}

export type EmailOtpRequestData = {
  username: string
  password: string
  request_code: string
}

export type LoginUri = {
  match: string | null
  response: string | null
  uri: string | null
}

export type MoveFolderData = {
  ids: string[]
  folderId: string
}

export type CipherData = {
  collectionIds: string[] | null
  organizationId: string | null
  folderId: string | null
  favorite: boolean
  fields: {
    name: string
    response: string | null
    types: number | null
    value: string
  }
  score: number | 0
  name: string
  notes: string | null
  type: number
  login: {
    username: string | null
    password: string | null
    totp: string | null
    response: string | null
    uris: LoginUri[] | null
  } | null
  secureNote: {
    type: number
    response: string | null
  } | null
  card: {
    brand: string | null
    cardholderName: string | null
    code: string | null
    expMonth: string | null
    expYear: string | null
    number: string | null
    response: string | null
  } | null
  identity: {
    address1: string | null
    address2: string | null
    address3: string | null
    city: string | null
    company: string | null
    country: string | null
    email: string | null
    firstName: string | null
    middleName: string | null
    lastName: string | null
    licenseNumber: string | null
    postalCode: string | null
    phone: string | null
    passportNumber: string | null
    response: string | null
    ssn: string | null
    state: string | null
    title: string | null
    username: string | null
  } | null
}

export type ImportCipherWithFolderData = {
  ciphers: CipherRequest[]
  folders: FolderRequest[]
  folderRelationships: {
    key: number
    value: number
  }[]
}

export type ImportCipherData = {
  ciphers: CipherRequest[]
}

export type ImportFolderData = {
  folders: FolderRequest[]
}

export type FeedbackData = {
  type: "feedback" | "support"
  description: string
}

export type UpdateFCMData = {
  fcm_id: string
  device_identifier: string
}

export type GetSharingPublicKeyData = {
  email: string
}

export type ShareCipherData = {
  cipher: CipherRequest & { id: string }
  sharing_key: string
  members: {
    username: string
    role: AccountRoleText
    key: string
    hide_passwords: boolean
  }[]
  groups?: {
    id: string
    role: string
    members: {
      username: string
      key: string
    }[]
  }[]
}

export type QuickShareCipherData = {
  cipher: CipherRequest
  cipher_id: string
  key: string
  each_email_access_count: number | null
  emails: string[]
  expiration_date: number | null
  max_access_count: number | null
  require_otp: boolean
}

export type ShareFolderData = {
  sharing_key: string
  members: {
    username: string
    role: AccountRoleText
    key: string
    hide_passwords: boolean
  }[]
  groups?: {
    id: string
    role: string
    members: {
      username: string
      key: string
    }[]
  }[]
} & CollectionActionData

export type CollectionActionData = {
  folder: {
    id: string
    name: string
    ciphers: any[] // CipherRequest & { id: string }
  }
}

export type ShareMultipleCiphersData = {
  ciphers: {
    cipher: CipherRequest & { id: string }
    members: {
      username: string
      role: AccountRoleText
      key: string
      hide_passwords: boolean
    }[]
    groups?: {
      id: string
      role: string
      members: {
        username: string
        key: string
      }[]
    }[]
  }[]
  sharing_key: string
}

export type ShareInvitationResponseData = {
  status: "accept" | "reject"
}

export type StopShareCipherData = {
  cipher: CipherRequest & { id: string }
}

export type EditShareCipherData = {
  role: AccountRoleText
  hide_passwords?: boolean
}

export type ConfirmShareCipherData = {
  key: string
}

export type AppNotification = {
  count: number
  unread_count: number
  results: {
    description: any
    id: string
    metadata: {
      is_grantee?: boolean
      is_grantor?: boolean
    }
    publish_time: number
    read: boolean
    title: {
      en: string
      vi: string
    }
    type: NotificationCategory
  }[]
}

// ---------------------- ENTERPRISE --------------------------

export type GroupData = {
  creation_date: number
  enterprise_id?: string
  id: string
  name: string
  revision_date: number
}

export type GroupMemberData = {
  avatar: string
  domain_id: string | null
  email: string
  full_name: string
  is_activated: boolean
  public_key: string
  role: EnterpriseGroupRoleText
  status: string
  username: string
}

export type EnterpriseInvitationByDomain = {
  auto_approve: boolean
  domain: string
  id: number
}

export type EnterpriseInvitation = {
  access_time: number
  domain: EnterpriseInvitationByDomain
  enterprise: {
    id: string
    name: string
  }
  id: string
  owner: string
  owner_email: string
  role: AccountRoleText
  status: EnterpriseInvitationStatus
}

export type OnpremisePreloginPayload = {
  email?: string
  code?: string
  identifier?: string
}
export type WebauthCredential = {
  id: string
  created_time: number
  webauthn_credential_id: string
  webauthn_public_key: string
  name: string
  last_used_time: number
}
