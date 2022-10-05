import { PushNotifier } from "."
import { CipherType } from "../../../core/enums"
import { load, StorageKey } from "../storage"
import { ConfirmShareData, NewShareData, PushEvent, ResponseShareData, EmergencyAccessData } from "./types"


// New share
export const handleNewShare = async (data: string) => {
  const shareData: NewShareData = JSON.parse(data)
  const { pwd_user_id, language } = await _getCurrentUser()
  const isVn = language === 'vi'

  // Only noti current user
  if (!pwd_user_id || !shareData.pwd_user_ids.map(i => i.toString()).includes(pwd_user_id)) {
    return
  }

  if (shareData.count) {
    PushNotifier._notify({
      id: `share_new`,
      title: isVn ? 'Locker' : 'Locker',
      body: isVn ? `Bạn đã được chia sẻ ${shareData.count} mục. Vào Locker để chấp nhận hoặc từ chối.` : `You have ${shareData.count} new shared items. Open Locker to accept or reject.`,
      data: {
        type: PushEvent.SHARE_NEW
      }
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
    // case CipherType.DriverLicense:
    //   typeName = isVn ? 'goi' : 'note'
    //   break
    // case CipherType.CitizenID:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.Passport:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.SocialSecurityNumber:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.WirelessRouter:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.Server:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.APICipher:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.Database:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    default: 
      typeName = isVn ? 'mục' : 'item'
  }

  PushNotifier._notify({
    id: `share_new`,
    title: isVn ? 'Locker' : 'Locker',
    body: isVn ? `Bạn đã được chia sẻ một ${typeName}` : `You have a new shared ${typeName}`,
    data: {
      type: PushEvent.SHARE_NEW
    }
  })
}


export const handleConfirmShare = async (data: string) => {
  const shareData: ConfirmShareData = JSON.parse(data)
  const { pwd_user_id, language } = await _getCurrentUser()
  const isVn = language === 'vi'

  // Only noti current user
  if (!shareData.pwd_user_ids.map(i => i.toString()).includes(pwd_user_id)) {
    return
  }

  PushNotifier._notify({
    id: `share_confirm`,
    title: isVn ? 'Locker' : 'Locker',
    body: isVn ? `Vui lòng xác nhận yêu cầu chia sẻ của bạn` : `Please confirm your sharing request`,
    data: {
      type: PushEvent.SHARE_CONFIRM
    }
  })
}

// Accept/Reject share
export const handleResponseShare = async (data: string, accepted: boolean) => {
  const shareData: ResponseShareData = JSON.parse(data)
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
    // case CipherType.DriverLicense:
    //   typeName = isVn ? 'goi' : 'note'
    //   break
    // case CipherType.CitizenID:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.Passport:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.SocialSecurityNumber:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.WirelessRouter:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.Server:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.APICipher:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    // case CipherType.Database:
    //   typeName = isVn ? 'ghi chú' : 'note'
    //   break
    default: 
    typeName = isVn ? 'mục' : 'item'
  }

  if (accepted) {
    PushNotifier._notify({
      id: `share_accepted`,
      title: isVn ? 'Locker' : 'Locker',
      body: isVn ? `${shareData.recipient_name} đã chấp nhận ${typeName} bạn chia sẻ` : `${shareData.recipient_name} has accepted the ${typeName} you share`,
      data: {
        type: PushEvent.SHARE_ACCEPT
      }
    })
  } else {
    PushNotifier._notify({
      id: `share_rejected`,
      title: isVn ? 'Locker' : 'Locker',
      body: isVn ? `${shareData.recipient_name} đã từ chối ${typeName} bạn chia sẻ` : `${shareData.recipient_name} has rejected the ${typeName} you share`,
      data: {
        type: PushEvent.SHARE_REJECT
      }
    })
  }
}

export const handleInviteEA = async (data: string) => {
  const eaData: EmergencyAccessData = JSON.parse(data)
  const { language } = await _getCurrentUser()
  const isVn = language === 'vi'

  const user = eaData.grantee_name || eaData.grantor_name

  PushNotifier._notify({
    id: `ea_invite`,
    title: 'Locker',
    body: isVn ? `${user} đã thêm bạn làm Liên hệ khẩn cấp` : `${user} has invited you to be emergency access contact`,
    data: {
      type: PushEvent.EMERGENCY_INVITE
    }
  })
}

export const handleIviteResponseEA = async (data: string, response: boolean) => {
  const eaData: EmergencyAccessData = JSON.parse(data)
  const { language } = await _getCurrentUser()
  const isVn = language === 'vi'

  const user = eaData.grantee_name

  const acceptText = isVn ? `${user} đã chấp nhận trở thành Liên hệ khẩn cấp của bạn` : `${user} has been accepted your emergency access invitation`
  const rejectText = isVn ? `${user} đã từ chối trở thành Liên hệ khẩn cấp của bạn` : `${user} has been rejected your emergency access invitation`

  PushNotifier._notify({
    id: `ea_invite_response`,
    title: 'Locker',
    body: response ? acceptText : rejectText,
    data: {
      type: PushEvent.EMERGENCY_ACCEPT_INVITATION
    }
  })
}

export const handleRequestEA = async (data: string) => {
  const eaData: EmergencyAccessData = JSON.parse(data)
  const { language } = await _getCurrentUser()
  const isVn = language === 'vi'

  const view = isVn ? "Xem" : "View"
  const takeOver = isVn ? "Chiếm quyền" : "Takeover"
  const user = eaData.grantee_name
  const type = eaData.type.toLowerCase() === "view" ? view : takeOver

  PushNotifier._notify({
    id: `ea_request`,
    title: 'Locker',
    body: isVn ? `${user} đã yêu cầu ${type} tài khoản Locker của bạn ${type}` : `${user} has requested to ${type} your Locker account`,
    data: {
      type: PushEvent.EMERGENCY_INITIATE
    }
  })
}

export const handleRequestEAResponseEA = async (data: string, response: boolean) => {
  const eaData: EmergencyAccessData = JSON.parse(data)
  const { language } = await _getCurrentUser()
  const isVn = language === 'vi'

  const view = isVn ? "Xem" : "View"
  const takeOver = isVn ? "Chiếm quyền" : "Takeover"
  const type = eaData.type.toLowerCase() === "view" ? view : takeOver
  const user = eaData.grantor_name

  const acceptText = isVn ? `${user} đã chấp nhận yêu cầu ${type} tài khoản Locker của bạn` : `${user} approved your request to ${type} their Locker account`
  const rejectText = isVn ? `${user} đã từ chối yêu cầu ${type} tài khoản Locker của bạn` : `${user} has rejected your request to ${type} their Locker account`

  PushNotifier._notify({
    id: `ea_rq_response`,
    title: 'Locker',
    body: response ? acceptText : rejectText,
    data: {
      type: PushEvent.EMERGENCY_APPROVE_REQUEST
    }
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
