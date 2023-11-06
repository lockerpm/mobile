import { CipherType } from '../../../core/enums'
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
  const isVn = language === 'vi'

  // Only noti current user
  if (!pwd_user_id || !shareData.pwd_user_ids.map((i) => i.toString()).includes(pwd_user_id)) {
    return
  }

  if (shareData.count) {
    notify({
      id: `share_new`,
      title: isVn ? 'Locker' : 'Locker',
      body: isVn
        ? `Bạn đã được chia sẻ ${shareData.count} mục. Vào Locker để chấp nhận hoặc từ chối.`
        : `You have ${shareData.count} new shared items. Open Locker to accept or reject.`,
      data: {
        type: PushEvent.SHARE_NEW,
      },
    })
    return
  }

  let typeName = isVn ? 'mục' : 'item'
  switch (shareData.share_type) {
    case CipherType.Card:
      typeName = isVn ? 'thẻ tín dụng' : 'card'
      break
    case CipherType.CryptoWallet:
      typeName = isVn ? 'ví crypto' : 'crypto wallet'
      break
    case CipherType.Identity:
      typeName = isVn ? 'danh tính' : 'identity'
      break
    case CipherType.Login:
      typeName = isVn ? 'mật khẩu' : 'password'
      break
    case CipherType.SecureNote:
      typeName = isVn ? 'ghi chú' : 'note'
      break
    default:
      typeName = isVn ? 'mục' : 'item'
  }

  notify({
    id: `share_new`,
    title: isVn ? 'Locker' : 'Locker',
    body: isVn ? `Bạn đã được chia sẻ một ${typeName}` : `You have a new shared ${typeName}`,
    data: {
      type: PushEvent.SHARE_NEW,
    },
  })
}

export const handleConfirmShare = async (data: string | object) => {
  const shareData: ConfirmShareData = parseDataType(data)
  const { pwd_user_id, language } = await _getCurrentUser()
  const isVn = language === 'vi'

  // Only noti current user
  if (!shareData.pwd_user_ids.map((i) => i.toString()).includes(pwd_user_id)) {
    return
  }

  notify({
    id: `share_confirm`,
    title: isVn ? 'Locker' : 'Locker',
    body: isVn
      ? `Vui lòng xác nhận yêu cầu chia sẻ của bạn`
      : `Please confirm your sharing request`,
    data: {
      type: PushEvent.SHARE_CONFIRM,
    },
  })
}

// Accept/Reject share
export const handleResponseShare = async (data: string | object, accepted: boolean) => {
  const shareData: ResponseShareData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const isVn = language === 'vi'

  let typeName = isVn ? 'mục' : 'item'
  switch (shareData.share_type) {
    case CipherType.Card:
      typeName = isVn ? 'thẻ tín dụng' : 'card'
      break
    case CipherType.CryptoWallet:
      typeName = isVn ? 'ví crypto' : 'crypto wallet'
      break
    case CipherType.Identity:
      typeName = isVn ? 'danh tính' : 'identity'
      break
    case CipherType.Login:
      typeName = isVn ? 'mật khẩu' : 'password'
      break
    case CipherType.SecureNote:
      typeName = isVn ? 'ghi chú' : 'note'
      break
    default:
      typeName = isVn ? 'mục' : 'item'
  }

  if (accepted) {
    notify({
      id: `share_accepted`,
      title: isVn ? 'Locker' : 'Locker',
      body: isVn
        ? `${shareData.recipient_name} đã chấp nhận ${typeName} bạn chia sẻ`
        : `${shareData.recipient_name} has accepted the ${typeName} you share`,
      data: {
        type: PushEvent.SHARE_ACCEPT,
      },
    })
  } else {
    notify({
      id: `share_rejected`,
      title: isVn ? 'Locker' : 'Locker',
      body: isVn
        ? `${shareData.recipient_name} đã từ chối ${typeName} bạn chia sẻ`
        : `${shareData.recipient_name} has rejected the ${typeName} you share`,
      data: {
        type: PushEvent.SHARE_REJECT,
      },
    })
  }
}

export const handleInviteEA = async (data: string | object) => {
  const eaData: EmergencyAccessData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const isVn = language === 'vi'

  const user = eaData.grantee_name || eaData.grantor_name

  notify({
    id: `emergency_access_notification`,
    title: 'Locker',
    body: isVn
      ? `${user} đã thêm bạn làm Liên hệ khẩn cấp`
      : `${user} has invited you to be emergency access contact`,
    data: {
      type: PushEvent.EMERGENCY_INVITE,
    },
  })
}

export const handleIviteResponseEA = async (data: string | object, response: boolean) => {
  const eaData: EmergencyAccessData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const isVn = language === 'vi'

  const user = eaData.grantee_name

  const acceptText = isVn
    ? `${user} đã chấp nhận trở thành Liên hệ khẩn cấp của bạn`
    : `${user} has accepted your emergency access invitation`
  const rejectText = isVn
    ? `${user} đã từ chối trở thành Liên hệ khẩn cấp của bạn`
    : `${user} has rejected your emergency access invitation`

  notify({
    id: `emergency_access_notification`,
    title: 'Locker',
    body: response ? acceptText : rejectText,
    data: {
      type: PushEvent.EMERGENCY_ACCEPT_INVITATION,
    },
  })
}

export const handleRequestEA = async (data: string | object) => {
  const eaData: EmergencyAccessData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const isVn = language === 'vi'

  const view = isVn ? 'Xem' : 'View'
  const takeOver = isVn ? 'Chiếm quyền' : 'Takeover'
  const user = eaData.grantee_name
  const type = eaData.type.toLowerCase() === 'view' ? view : takeOver

  notify({
    id: `emergency_access_notification`,
    title: 'Locker',
    body: isVn
      ? `${user} đã yêu cầu ${type} tài khoản Locker của bạn ${type}`
      : `${user} has requested to ${type} your Locker account`,
    data: {
      type: PushEvent.EMERGENCY_INITIATE,
    },
  })
}

export const handleRequestEAResponseEA = async (data: string | object, response: boolean) => {
  const eaData: EmergencyAccessData = parseDataType(data)
  const { language } = await _getCurrentUser()
  const isVn = language === 'vi'

  const view = isVn ? 'Xem' : 'View'
  const takeOver = isVn ? 'Chiếm quyền' : 'Takeover'
  const type = eaData.type.toLowerCase() === 'view' ? view : takeOver
  const user = eaData.grantor_name

  const acceptText = isVn
    ? `${user} đã chấp nhận yêu cầu ${type} tài khoản Locker của bạn`
    : `${user} approved your request to ${type} their Locker account`
  const rejectText = isVn
    ? `${user} đã từ chối yêu cầu ${type} tài khoản Locker của bạn`
    : `${user} has rejected your request to ${type} their Locker account`

  notify({
    id: `emergency_access_notification`,
    title: 'Locker',
    body: response ? acceptText : rejectText,
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
