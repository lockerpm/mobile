import { CipherType } from "core/enums";

export class Localize {
  private language: 'vi' | 'en' | 'zh';

  public constructor(language: 'vi' | 'en' | 'zh') {
    this.language = language;
  }

  public shareTypeName(shareType: number): string {
    const typeName = {
      en: {
        card: "card",
        cryptoWallet: 'crypto wallet',
        identity: "identity",
        login: "password",
        secureNote: "note",
        default: "item"
      },
      vi: {
        card: "thẻ tín dụng",
        cryptoWallet: 'ví crypto',
        identity: "danh tính",
        login: "mật khẩu",
        secureNote: "ghi chú",
        default: "mục"
      },
      zh: {
        card: "卡片",
        cryptoWallet: '加密钱包',
        identity: "身份",
        login: "密码",
        secureNote: "笔记",
        default: "物品"
      }
    }
    switch (shareType) {
      case CipherType.Card:
        return typeName[this.language].card
      case CipherType.CryptoWallet:
        return typeName[this.language].cryptoWallet
      case CipherType.Identity:
        return typeName[this.language].identity
      case CipherType.Login:
        return typeName[this.language].login
      case CipherType.SecureNote:
        return typeName[this.language].secureNote
      default:
        return typeName[this.language].default
    }
  }

  private eaTypeNam(isView): string {
    const view = {
      vi: 'Xem',
      en:  'View',
      zh: '看法',
    }
    const takeOver = {
      vi: 'Chiếm quyền',
      en: 'Takeover',
      zh: '接管',
    }
    return isView? view[this.language] : takeOver[this.language]
  }

  public handleNewShares(count: number): string {
    const body = {
      vi: `Bạn đã được chia sẻ ${count} mục. Vào Locker để chấp nhận hoặc từ chối.`,
      en: `You have ${count} new shared items. Open Locker to accept or reject.`,
      zh: `您有 ${count} 个新共享项目。 打开储物柜接受或拒绝.`
    }
    return body[this.language] || body.en;
  }

  public handleNewShare(shareType: number): string {
    const typeName = this.shareTypeName(shareType)

    const body = {
      vi: `Bạn đã được chia sẻ một ${typeName}`,
      en: `You have a new shared ${typeName}`,
      zh: `您有一个新共享 ${typeName}`
    }
    return body[this.language] || body.en;
  }
  
  public confirmShare(): string {
    const body = {
      vi: `Vui lòng xác nhận yêu cầu chia sẻ của bạn`,
      en: `Please confirm your sharing request`,
      zh: `请确认您的共享请求`
    }
    return body[this.language]
  }

  public acceptShare(recipientName: string, shareType: number): string {
    const typeName = this.shareTypeName(shareType)
    const body = {
      vi: `${recipientName} đã chấp nhận ${typeName} bạn chia sẻ`,
      en: `${recipientName} has accepted the ${typeName} you share`,
      zh: `${recipientName} 已接受您共享的 ${typeName}`
    }
    return body[this.language]
  }

  public rejectShare(recipientName: string, shareType: number): string {
    const typeName = this.shareTypeName(shareType)
    const body = {
      vi: `${recipientName} đã từ chối ${typeName} bạn chia sẻ`,
      en: `${recipientName} has rejected the ${typeName} you share`,
      zh: `${recipientName} 已拒绝您的 ${typeName} 份额`
    }
    return body[this.language]
  }

  public inviteEA(user: string): string {
    const body = {
      vi: `${user} đã thêm bạn làm Liên hệ khẩn cấp`,
      en: `${user} has invited you to be emergency access contact`,
      zh: `${user} 邀请您成为紧急访问联系人`,
    }
    return body[this.language]
  }

  public iviteResponseEA(user: string, isAccept: boolean): string {
    const acceptBody = {
      vi: `${user} đã chấp nhận trở thành Liên hệ khẩn cấp của bạn`,
      en: `${user} has accepted your emergency access invitation`,
      zh: `${user} 已接受您的紧急访问邀请`,
    }
    const rejectBody = {
      vi: `${user} đã từ chối trở thành Liên hệ khẩn cấp của bạn`,
      en: `${user} has rejected your emergency access invitation`,
      zh: `${user} 已拒绝您的紧急访问邀请`,
    }
    return isAccept ? acceptBody[this.language] :  rejectBody[this.language]
  }

  public requestEA(user: string, isView: boolean): string {
    const type = this.eaTypeNam(isView)

    const body = {
      vi: `${user} đã yêu cầu ${type} tài khoản Locker của bạn`,
      en: `${user} has requested to ${type} your Locker account`,
      zh: `${user} 已请求 ${type} 您的 Locker 帐户`,
    }
    return body[this.language]
  }

  public requestResponseEA(user: string, isAccept: boolean, isView: boolean): string {
    const type = this.eaTypeNam(isView)
    const acceptBody = {
      vi: `${user} đã chấp nhận yêu cầu ${type} tài khoản Locker của bạn`,
      en: `${user} approved your request to ${type} their Locker account`,
      zh: `${user} 批准了您对 ${type} 他们的 Locker 帐户的请求`,
    }
    const rejectBody = {
      vi: `${user} đã từ chối yêu cầu ${type} tài khoản Locker của bạn`,
      en: `${user} has rejected your request to ${type} their Locker account`,
      zh: `${user} 拒绝了您对 ${type} 他们的 Locker 帐户的请求`,
    }
    return isAccept ? acceptBody[this.language] :  rejectBody[this.language]
  }
}
