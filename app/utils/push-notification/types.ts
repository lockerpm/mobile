import { CipherType } from "../../../core/enums"

export enum PushEvent {
  SHARE_NEW = 'new_share_item',
  SHARE_CONFIRM = 'confirm_share_item',
  SHARE_ACCEPT = 'accept_share_item',
  SHARE_REJECT = 'reject_share_item',
  EMERGENCY_INVITE = "emergency_invite",
  EMERGENCY_ACCEPT_INVITATION = "emergency_accept_invitation",
  EMERGENCY_REJECT_INVITATION = "emergency_reject_invitation",
  EMERGENCY_INITIATE = "emergency_access_initiate",
  EMERGENCY_APPROVE_REQUEST = "emergency_access_approve_request",
  EMERGENCY_REJECT_REQUEST = "emergency_access_reject_request",

  TIP_TRICK = 'password_tip_trick' // new updates info
}



export type NotifeeNotificationData = {
  type?: PushEvent
  url?: string
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

export type EmergencyAccessData = {
  id?: string
  type?: string
  grantee_name?: string
  grantor_name?: string
  is_grantor?: boolean
  is_grantee?: boolean
}

export type TipTrickData = {
  title: {
    en: string
    vi: string
  },
  metadata: {
    link: {
      en: string
      vi: string
    },
  }
}
