import { load, StorageKey } from '../storage'
import {
  ConfirmShareData,
  NewShareData,
  PushEvent,
  ResponseShareData,
  EmergencyAccessData,
  TipTrickData,
} from './types'
import { Logger } from '../utils'
import { notify } from './notify'
import { Localize } from './Localize'

const parseDataType = (data: string | object) => {
  try {
    if (typeof data === 'string') return JSON.parse(data)
    else return data
  } catch (e) {
    Logger.error(e)
    return {}
  }
}


// New share
export const handleNewShare = async (data: string | object) => {
  const shareData: NewShareData = parseDataType(data)
  const { pwd_user_id, language } = await _getCurrentUser()
  const i = new Localize(language)

  // Only noti current user
  if (!pwd_user_id || !shareData.pwd_user_ids.map((i) => i.toString()).includes(pwd_user_id)) {
    return
  }

  if (shareData.count) {
    notify({
      id: `share_new`,
      title: 'Locker',
      body: i.handleNewShares(shareData.count),
      data: {
        type: PushEvent.SHARE_NEW,
      },
    })
    return
  }
  notify({
    id: `share_new`,
    title: 'Locker',
    body: i.handleNewShares(shareData.share_type),
    data: {
      type: PushEvent.SHARE_NEW,
    },
  })
}

export const handleConfirmShare = async (data: string | object) => {
  const shareData: ConfirmShareData = parseDataType(data)
  const { pwd_user_id, language } = await _getCurrentUser()
  const i = new Localize(language)

  // Only noti current user
  if (!shareData.pwd_user_ids.map((i) => i.toString()).includes(pwd_user_id)) {
    return
  }

  notify({
    id: `share_confirm`,
    title:  'Locker',
    body: i.confirmShare(),
    data: {
      type: PushEvent.SHARE_CONFIRM,
    },
  })
}

// Accept/Reject share
export const handleResponseShare = async (data: string | object, accepted: boolean) => {
  const shareData: ResponseShareData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const i = new Localize(language)

  if (accepted) {
    notify({
      id: `share_accepted`,
      title:  'Locker',
      body: i.acceptShare(shareData.recipient_name, shareData.share_type),
      data: {
        type: PushEvent.SHARE_ACCEPT,
      },
    })
  } else {
    notify({
      id: `share_rejected`,
      title:  'Locker',
      body: i.rejectShare(shareData.recipient_name, shareData.share_type),
      data: {
        type: PushEvent.SHARE_REJECT,
      },
    })
  }
}

export const handleInviteEA = async (data: string | object) => {
  const eaData: EmergencyAccessData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const i = new Localize(language)

  const user = eaData.grantee_name || eaData.grantor_name

  notify({
    id: `emergency_access_notification`,
    title: 'Locker',
    body: i.inviteEA(user),
    data: {
      type: PushEvent.EMERGENCY_INVITE,
    },
  })
}

export const handleIviteResponseEA = async (data: string | object, response: boolean) => {
  const eaData: EmergencyAccessData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const i = new Localize(language)

  const user = eaData.grantee_name
  notify({
    id: `emergency_access_notification`,
    title: 'Locker',
    body: i.iviteResponseEA(user, response),
    data: {
      type: PushEvent.EMERGENCY_ACCEPT_INVITATION,
    },
  })
}

export const handleRequestEA = async (data: string | object) => {
  const eaData: EmergencyAccessData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const i = new Localize(language)

  const user = eaData.grantee_name

  notify({
    id: `emergency_access_notification`,
    title: 'Locker',
    body: i.requestEA(user, eaData.type.toLowerCase() === 'view'),
    data: {
      type: PushEvent.EMERGENCY_INITIATE,
    },
  })
}

export const handleRequestEAResponseEA = async (data: string | object, response: boolean) => {
  const eaData: EmergencyAccessData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const i = new Localize(language)
  const user = eaData.grantor_name
  notify({
    id: `emergency_access_notification`,
    title: 'Locker',
    body: i.requestResponseEA(user, response, eaData.type.toLowerCase() === 'view'),
    data: {
      type: PushEvent.EMERGENCY_APPROVE_REQUEST,
    },
  })
}

export const handleTipTrick = async (data: string | object) => {
  const tipTrickdata: TipTrickData = parseDataType(data)
  const { language } = await _getCurrentUser()
  // const isVn = language === 'vi'
  const text = tipTrickdata.data.title[language]

  notify({
    id: `new_feature`,
    title: 'Locker',
    body: text,
    data: {
      type: PushEvent.TIP_TRICK,
      url: tipTrickdata.data.metadata.link[language],
    },
  })
}
// ------------------ PRIVATE --------------------

const _getCurrentUser = async () => {
  const currentUser = await load(StorageKey.APP_CURRENT_USER)
  if (!currentUser) {
    return {}
  }

  const { language, pwd_user_id } = currentUser
  return { language, pwd_user_id }
}
