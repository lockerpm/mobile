import { DeviceType } from "core/enums"
import { KdfType } from "core/enums/kdfType"
import { CipherRequest } from "core/models/request/cipherRequest"

import { LanguageSupportType } from "@/i18n"

import {
  AccountRoleText,
  EmergencyAccessStatus,
  EmergencyAccessType,
  InvitationStatus,
  LoginMethod,
  NotificationCategory,
  PlanType,
  PlanTypeDuration,
  PolicyType,
} from "./enum"

export type MasterPasswordConfig = {
  kdf: KdfType
  kdf_iterations: number
}

export type UserIDType = {
  full_name: string
  organization: any
  country: string
  language: LanguageSupportType
  customer_language: LanguageSupportType
  phone: string
  avatar: string
  email: string
  username: string
}

export type UserLockerType = {
  timeout: number
  timeout_action: string
  sync_all_platforms: boolean
  block_by_source: boolean
  is_pwd_manager: boolean
  pwd_user_id: string
  login_method: LoginMethod
  hide_master_password: boolean
  pwd_user_type: string
  pwd_plan: PlanType
  is_require_passwordless: boolean
  is_require_2fa: boolean
  name: string
  email: string
}

export type GetPMTokenData = {
  SERVICE_URL: "/"
  SERVICE_SCOPE: "pwdmanager"
  CLIENT: "mobile"
}

export type User2FAMethod =
  | {
      type: "mail"
      data: string
    }
  | {
      type: "smart_otp"
      data: any
    }

export type User2FAPasswordConfig = {
  username: string
  password: string
  methods: User2FAMethod[]
}

export type User2FAPincodeConfig = {
  nonce: string
  code: string
  methods: User2FAMethod[]
}

export type Enterprise = {
  creation_date: number
  description: string
  id: string
  is_default: boolean
  locked: boolean
  name: string
  organization_id: string
  revision_date: null
  role: string
}

export type SessionSnapshot = {
  access_token: string
  refresh_token: string
  key: string
  private_key: string
  has_no_master_pw_item: boolean
  is_factor2?: boolean
  methods: { type: string; data: any }[]
}

export type UserTeam = {
  id: string
  description: string
  name: string
  role: AccountRoleText
  creation_date: number
  revision_date: number
  is_business: boolean
  locker: boolean
  organization_id: string
}

export type UserInvitations = {
  access_time: number
  id: string
  role: AccountRoleText
  status: InvitationStatus
  team: {
    id: string
    name: string
    organization_id: string
  }
}

export type PasswordPolicy = {
  policy_type: PolicyType.PASSWORD_REQ
  enabled: boolean
  config: {
    min_length: number
    require_digit: boolean
    require_lower_case: boolean
    require_special_character: boolean
    require_upper_case: boolean
  }
}

export type MasterPasswordPolicy = {
  policy_type: PolicyType.MASTER_PASSWORD_REQ
  enabled: boolean
  config: {
    min_length: number
    require_digit: boolean
    require_lower_case: boolean
    require_special_character: boolean
    require_upper_case: boolean
  }
}

export type BlockFailedLoginPolicy = {
  policy_type: PolicyType.BLOCK_FAILED_LOGIN
  enabled: boolean
  config: {
    failed_login_attempts: number
    failed_login_block_time: number
    failed_login_duration: number
    failed_login_owner_email: boolean
  }
}

export type PasswordlessPolicy = {
  policy_type: PolicyType.PASSWORDLESS
  enabled: boolean
  config: {
    only_allow_passwordless: boolean
  }
}

export type TeamPolicies = [
  PasswordPolicy,
  MasterPasswordPolicy,
  BlockFailedLoginPolicy,
  PasswordlessPolicy,
]

export type Billing = {
  id: number
  created_time: number
  currency: "VNP" | "USD"
  description: string
  discount: number
  duration: PlanTypeDuration
  failure_reason?: string
  payment_id: string
  payment_method: string
  plan: string
  status: string
  total_price: number
  transaction_type: string
}

export type FamilyMember = {
  id: number
  email: string
  avatar?: string
  created_time?: string
  username?: string
  full_name?: string
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

export type AppNotificationCodeWithMetadata = {
  100002: {
    recipient_name: string
  }
  100001: {
    recipient_name: string
  }
  100003: {
    owner_name: string
    cipher_type: string
  }
  100004: null
  100005: {
    member_joined_text_vi: string
    member_joined_text_en: string
    member_joined_text: string
    sharing_id: string
    emails: string
    group_id: string
    group_name: string
  }
  100006: {
    owner_name: string
    owner_email: string
    cipher_type: string
  }
  100007: {
    team_id: string
    payment_id: string
  }
  100008: {
    team_id: string
    payment_id: string
  }
  100009: {
    grantee_name: string
    grantee_email: string
    request: string
  }
  100010: {
    grantee_name: string
    grantee_email: string
    request: string
  }
  100011: {
    grantee_name: string
    grantee_email: string
    request: string
  }
  100012: {
    grantee_name: string
    grantee_email: string
    request: string
  }
  100013: {
    grantee_name: string
    grantee_email: string
    request: string
  }
  100014: {
    grantee_name: string
    grantee_email: string
    request: string
  }
  100015: {
    grantee_name: string
    grantee_email: string
    request: string
  }
  100016: {
    grantee_name: string
    grantee_email: string
    request: string
  }
  100017: {
    link: {
      vi: string
      en: string
    }
    title: string
  }
}

export type AppNotificationMetadata = {
  is_grantee?: boolean
  is_grantor?: boolean

  // v2
  grantee_name?: string
  grantee_email?: string
  link?: {
    vi: string
    en: string
  }
  title?: string
  team_id?: string
  payment_id?: string
  owner_name?: string
  owner_email?: string
  cipher_type?: string
  member_joined_text_vi?: string
  member_joined_text_en?: string
  member_joined_text?: string
  sharing_id?: string
  emails?: string
  group_id?: string
  group_name?: string
  recipient_name?: string
}

export type AppNotificationType = {
  id: string
  type: NotificationCategory
  notification_code: keyof AppNotificationCodeWithMetadata
  publish_time: number
  title: {
    en: string
    vi: string
  }
  description: {
    en: string
    vi: string
  }
  metadata: AppNotificationMetadata
  read: boolean
}

export type AppNotification = {
  count: number
  unread_count: number
  results: AppNotificationType[]
}

export type TrustedContact = {
  avatar: string
  creation_date: number
  email: string
  full_name: string
  grantor_pwd_user_id?: string
  grantee_pwd_user_id?: string
  id: string
  key_encrypted: string
  last_notification_date: number | null
  object: string
  recovery_initiated_date: number | null
  revision_date: number
  status: EmergencyAccessStatus
  type: EmergencyAccessType
  wait_time_days: number
}

export type SessionLoginRequest = {
  client_id: "mobile"
  password: string
  device_name: string
  device_type: DeviceType
  device_identifier: string
  email: string
}

export type SessionOtpLoginRequest = {
  method: string
  otp: string
  save_device: boolean
} & SessionLoginRequest

export type RegisterLockerRequest = {
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

export type ChangePasswordRequest = {
  key: string
  new_master_password_hash: string
  master_password_hash: string
  master_password_cipher: CipherRequest
  new_master_password_hint: string
  kdf: number
  kdf_iterations: number
}

export type FeedbackRequest = {
  type: "feedback" | "support"
  description: string
}

export type UpdateFCMRequest = {
  fcm_id: string
  device_identifier: string
}

export type UserPlan = {
  name: string
  alias: PlanType
  is_family: boolean
  cancel_at_period_end: boolean
  duration: PlanTypeDuration
  next_billing_time: number
  payment_method: string
  max_number: number
}

export type OnPremiseIdentifierData = {
  host: string
  use_sso: boolean
  identifier: string
}

export type OnpremisePreloginPayload = {
  email?: string
  code?: string
  identifier?: string
}

export type MarketingContent = {
  id: string
  image: string
  language: string
  link: string
  status: string
  text: string
}

export type ChatWootUser = {
  country_code: string
  email: string
  is_locker: boolean
  language_override: string
  name: string
  phone: string
  signed_up_at: number
  type: string
  user_hash: string
}
