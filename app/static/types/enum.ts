export enum AccountRole {
  OWNER = 0,
  ADMIN = 1,
  MANAGER = 3,
  MEMBER = 2,
}

export enum LockPMType {
  ONPREMISE = 'onPremise',
  INDIVIDUAL = 'individual'
}

export enum AccountType {
  PERSONAL = "personal",
  ENTERPRISE = "enterprise"
}

export enum EnterpriseGroupRoleText {
  PRIMARY_ADMIN = 'primary_admin',
  ADMIN = 'admin',
  MEMBER = 'member'
}
export enum EnterpriseInvitationStatus {
  INVITED = 'invited',
  REQUESTED = 'requested',
}

export enum AccountRoleText {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
}

export enum SocketEvent {
  SYNC = 'sync',
  MEMBERS = 'members',
  EMERGENCY_ACCESS = 'emergency_access',
  QUICK_SHARE = 'quick_share'
}

export enum SocketEventType {
  CIPHER_UPDATE = 'cipher_update',
  CIPHER = 'cipher',

  FOLDER_UPDATE = 'folder_update',
  FOLDER_DELETE = 'folder_delete',

  COLLECTION_UPDATE = 'collection_update',
  COLLECTION_DELETE = 'collection_delete',

  GROUP_CREATE = 'group_create',
  GROUP_UPDATE = 'group_update',
  GROUP_DELETE = 'group_delete',

  MEMBER_INVITATION = 'member_invitation',
  MEMBER_ACCEPTED = 'member_accepted',

  VAULT = 'sync_vault',

  ORG_KEY = 'sync_org_key',

  SYNC_SETTINGS = 'sync_settings',

  SYNC_EMERGENCY_ACCESS = 'emergency_access',
}

export enum SharingStatus {
  INVITED = 'invited',
  ACCEPTED = 'accepted',
  CONFIRMED = 'confirmed',
}

export enum SharingType {
  EDIT = 'Edit',
  VIEW = 'View',
  ONLY_FILL = 'Only fill',
}

export enum PlanType {
  FREE = 'pm_free',
  PREMIUM = 'pm_premium',
  FAMILY = 'pm_family',
  LIFETIME = 'pm_lifetime_premium',
}

export enum PlanTypeDuration {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum InvitationStatus {
  INVITED = 'invited',
  REJECTED = 'rejected',
  CONFIRMED = 'confirmed',
}

export enum NotificationCategory {
  ITEM_SHARE = 'item_sharing',
  EMERGENCY = 'emergency_access',
  DATA_BREACH = 'data_breach',
  PW_TIPS = 'password_tip_trick',
  MARKETING = 'marketing',
  OTHER = 'other',
}

export enum EmergencyAccessStatus {
  INVITED = 'invited',
  CONFIRMED = 'confirmed',
  RECOVERY_INITIATED = 'recovery_initiated',
  RECOVERY_APPROVED = 'recovery_approved',
}

export enum EmergencyAccessType {
  TAKEOVER = 'takeover',
  VIEW = 'view',
}

export enum PolicyType {
  PASSWORD_REQ = 'password_requirement',
  MASTER_PASSWORD_REQ = 'master_password_requirement',
  BLOCK_FAILED_LOGIN = 'block_failed_login',
  PASSWORDLESS = 'passwordless',
}

export enum LoginMethod {
  PASSWORD = 'password',
  PASSWORDLESS = 'passwordless'
}

export enum AppTimeoutType {
  SCREEN_OFF = -1,
  APP_CLOSE = 0,
}
export enum TimeoutActionType {
  LOCK = "lock",
  LOGOUT = "logout",
}