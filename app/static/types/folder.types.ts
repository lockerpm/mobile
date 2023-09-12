import { AccountRoleText } from "./enum"

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