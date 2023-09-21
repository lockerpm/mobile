import { CipherRequest } from 'core/models/request/cipherRequest'
import { AccountRoleText, SharingStatus, SharingType } from './enum'
import { FolderRequest } from 'core/models/request/folderRequest'
import {
  AttachmentView,
  CardView,
  CipherView,
  FieldView,
  IdentityView,
  LoginView,
  SecureNoteView,
} from 'core/models/view'
import { ImageSourcePropType } from 'react-native'
import { CipherType } from 'core/enums'
import { PasswordHistoryView } from 'core/models/view/passwordHistoryView'
import { CipherRepromptType } from 'core/enums/cipherRepromptType'

export type EditShareCipherData = {
  role: AccountRoleText
  hide_passwords?: boolean
}

export type ImportCipherWithFolderData = {
  ciphers: CipherRequest[]
  folders: FolderRequest[]
  folderRelationships: {
    key: number
    value: number
  }[]
}

export type ImportFolderData = {
  folders: FolderRequest[]
}

export type ImportCipherData = {
  ciphers: CipherRequest[]
}

export type MoveFolderData = {
  ids: string[]
  folderId: string
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

export type StopShareCipherData = {
  cipher: CipherRequest & { id: string }
}

export type ConfirmShareCipherData = {
  key: string
}

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

export type MyShareType = {
  id: string
  description: string
  name: string
  organization_id: string
  members: SharedMemberType[]
  groups: SharedGroupType[]
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

export type SharedGroupType = {
  access_time: number
  id: string
  name: string
  role: AccountRoleText
  share_type: SharingType
}

export type GetCiphersParams = {
  deleted: boolean
  searchText: string
  filters: ((c: CipherView) => boolean)[]
  includeExtensions?: boolean
}

export type CipherAppView = {
  id: string
  organizationId: string
  folderId: string
  name: string
  notes: string
  type: CipherType
  favorite: boolean
  organizationUseTotp: boolean
  edit: boolean
  viewPassword: boolean
  localData: any
  login: LoginView
  identity: IdentityView
  card: CardView
  secureNote: SecureNoteView
  attachments: AttachmentView[]
  fields: FieldView[]
  passwordHistory: PasswordHistoryView[]
  collectionIds: string[]
  revisionDate: Date
  deletedDate: Date
  reprompt: CipherRepromptType
  imgLogo: ImageSourcePropType
  notSync: boolean
  isDeleted: boolean
}

export interface FileData {
  name: string
  uri: string
  type: string
  size: number
}
