import { PushNotifier } from "."
import { CipherType } from "../../../core/enums"
import { load, StorageKey } from "../storage"
import { ConfirmShareData, NewShareData, PushEvent, ResponseShareData } from "./types"


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

const handleInviteEA = async () => {

}

const handleIviteresponseEA = async () => {

}

const handleRequestEA = async () => {

}

const handleRequestEAResponse = async () => {
  
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
