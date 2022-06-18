import { CipherType } from "../../../core/enums"

export enum PushEvent {
  SHARE_NEW = 'new_share_item',
  SHARE_CONFIRM = 'confirm_share_item',
  SHARE_ACCEPT = 'accept_share_item',
  SHARE_REJECT = 'reject_share_item'
}

export type NotifeeNotificationData = {
  type?: PushEvent
}

export type NewShareData = {
  pwd_user_ids: number[]
  share_type?: CipherType
  count?: number
  owner_name?: string
}

export type ResponseShareData = {
  share_type?: CipherType
  recipient_name: string
}

export type ConfirmShareData = {
  pwd_user_ids: number[]
}
