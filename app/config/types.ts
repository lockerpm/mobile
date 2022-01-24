export enum AccountRole {
  OWNER = 0,
  ADMIN = 1,
  MANAGER = 3,
  MEMBER = 2
}

export enum AccountRoleText {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member'
}

export enum SocketEvent {
  SYNC = 'sync',
  MEMBERS = 'members',
  EMERGENCY_ACCESS = 'emergency_access'
}

export enum SocketEventType {
  CIPHER_UPDATE = "cipher_update",
  CIPHER = "cipher",

  FOLDER_UPDATE = "folder_update",
  FOLDER_DELETE = "folder_delete",

  COLLECTION_UPDATE = "collection_update",
  COLLECTION_DELETE = "collection_delete",

  GROUP_CREATE = "group_create",
  GROUP_UPDATE = "group_update",
  GROUP_DELETE = "group_delete",

  MEMBER_INVITATION = "member_invitation",
  MEMBER_ACCEPTED = "member_accepted",

  VAULT = "sync_vault",

  ORG_KEY = "sync_org_key",

  SYNC_SETTINGS = "sync_settings",

  SYNC_EMERGENCY_ACCESS = "emergency_access"
}

export enum SharingStatus {
  INVITED = "invited",
  ACCEPTED = "accepted",
  CONFIRMED = "confirmed"
}

export enum SharingType {
  EDIT = "Edit",
  VIEW = "View",
  ONLY_FILL = "Only fill"
}

export enum PlanType {
  FREE = 'pm_free',
  PREMIUM = 'pm_premium',
  FAMILY = 'pm_family'
}

export enum InvitationStatus {
  INVITED = "invited",
  REJECTED = "rejected",
  CONFIRMED = "confirmed"
}
