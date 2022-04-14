import { CipherType } from "../../../core/enums"

export enum PushEvent {
  SHARE_NEW = 'new_share_item',
  SHARE_CONFIRM = 'confirm_share_item'
}

export type NotifeeNotificationData = {
  type?: PushEvent
}

export type NewShareData = {
  pwd_user_ids: number[]
  share_type?: CipherType
  count?: number
}

export type ConfirmShareData = {
  pwd_user_ids: number[]
}
