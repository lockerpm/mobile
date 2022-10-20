import {
  AccountRoleText,
  EmergencyAccessStatus,
  EmergencyAccessType,
  PolicyType,
  SharingStatus,
  SharingType,
} from '.'

export type SessionSnapshot = {
  access_token: string
  refresh_token: string
  key: string
  private_key: string
  has_no_master_pw_item: boolean
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

export type SharingInvitationType = {
  access_time: number
  cipher_type: number
  id: string
  item_type: string
  owner: {
    email: string
    full_name: string
  }
  role: AccountRoleText
  share_type: SharingType
  status: SharingStatus
  hide_passwords: boolean
  team: {
    id: string
    name: string
    organization_id: string
  }
}

export type SharedMemberType = {
  access_time: string
  avatar: string
  email: string
  full_name: string
  hide_passwords: boolean
  id: string
  pwd_user_id: string
  role: AccountRoleText
  share_type: SharingType
  status: SharingStatus
  username: string
}

export type MyShareType = {
  id: string
  description: string
  name: string
  organization_id: string
  members: SharedMemberType[]
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
export type SubdomainData = {
  id: number,
  subdomain: string
  created_time: number,
  num_alias: number,
  num_spam: number,
  num_forwarded: number
}

export type RelayAddress = {
  address: string
  created_time: number
  description: string
  domain: string
  enabled: boolean
  full_address: string
  id: number
  num_blocked: number
  num_forwarded: number
  num_replied: number
  num_spam: number
  updated_time: null
  subdomain: string
  block_spam: boolean
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
