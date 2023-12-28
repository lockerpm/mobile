import { DeviceType } from 'core/enums'
import {
  AccountRoleText,
  EmergencyAccessStatus,
  EmergencyAccessType,
  InvitationStatus,
  NotificationCategory,
  PolicyType,
} from './enum'
import { CipherRequest } from 'core/models/request/cipherRequest'

export type GetPMTokenData = {
  SERVICE_URL: '/'
  SERVICE_SCOPE: 'pwdmanager'
  CLIENT: 'mobile'
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
  PasswordlessPolicy
]

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
  client_id: 'mobile'
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
  full_name: string
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
}

export type FeedbackRequest = {
  type: 'feedback' | 'support'
  description: string
}

export type UpdateFCMRequest = {
  fcm_id: string
  device_identifier: string
}


export type OnpremisePreloginPayload = {
  email?: string
  code?: string
  identifier?: string
}

export type SSOUserData = {
    displayName: string
    email? : string,
    mail:string,
    name?: string,
    uid: string,
    username: string
}