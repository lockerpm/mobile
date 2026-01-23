import { AccountRoleText } from "./enum"

export enum FolderActionsModal {
  DEFAULT = "default",
  RENAME = "rename",
  DELETE = "delete",
  LEAVE_SHARE = "leaveShare",
  PREMIUM_ACTION = "premiumAction",
  CREATE = "create",
}

export type ShareFolderData = {
  sharing_key: string | null
  members: {
    username: string
    role: AccountRoleText
    key: string | null
    hide_passwords: boolean
  }[]
  groups?: {
    id: string
    role: string
    members: {
      username: string
      key: string | null
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
