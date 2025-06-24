import { CipherType } from "core/enums"
import en from "app/i18n/en"
import vi from "app/i18n/vi"
import zh from "app/i18n/zh"
import ru from "app/i18n/ru"
import fr from "app/i18n/fr"

export class Localize {
  private language: "vi" | "en" | "zh" | "ru" | "fr"
  private translations = { en, vi, zh, ru, fr }

  public constructor(language: "vi" | "en" | "zh" | "ru" | "fr") {
    this.language = language
  }

  get tl() {
    return this.translations[this.language]
  }

  private translate(t: string, options?: object) {
    if (!options) return t
    let result = t
    Object.keys(options).forEach((key) => {
      const re = new RegExp(`{{${key}}}`, "gi")
      result = result.replace(re, options[key])
    })

    return result
  }

  public shareTypeName(shareType: number): string {
    switch (shareType) {
      case CipherType.Card:
        return this.tl.common.card.toLowerCase()
      case CipherType.CryptoWallet:
        return this.tl.common.cryptoWallet.toLowerCase()
      case CipherType.Identity:
        return this.tl.common.identity.toLowerCase()
      case CipherType.Login:
        return this.tl.common.password.toLowerCase()
      case CipherType.SecureNote:
        return this.tl.common.note.toLowerCase()
      default:
        return this.tl.common.item.toLowerCase()
    }
  }

  private eaTypeNam(isView: boolean): string {
    return isView ? this.tl.emergency_access.view : this.tl.emergency_access.takeover
  }

  public handleNewShares(count: number): string {
    return this.translate(this.tl.push_noti.item_sharing.new_shares, {
      count,
    })
  }

  public handleNewShare(shareType: number): string {
    const typeName = this.shareTypeName(shareType)
    return this.translate(this.tl.push_noti.item_sharing.new_share, {
      typeName,
    })
  }

  public confirmShare(): string {
    return this.tl.push_noti.item_sharing.confirm
  }

  public acceptShare(recipientName = "", shareType: number): string {
    const typeName = this.shareTypeName(shareType)
    return this.translate(this.tl.push_noti.item_sharing.accept, {
      recipientName,
      typeName,
    })
  }

  public rejectShare(recipientName = "", shareType: number): string {
    const typeName = this.shareTypeName(shareType)
    return this.translate(this.tl.push_noti.item_sharing.reject, {
      recipientName,
      typeName,
    })
  }

  public inviteEA(user = ""): string {
    return this.translate(this.tl.push_noti.emergency_access.invite, {
      user,
    })
  }

  public iviteResponseEA(user = "", isAccept: boolean): string {
    return isAccept
      ? this.translate(this.tl.push_noti.emergency_access.accept_invite, { user })
      : this.translate(this.tl.push_noti.emergency_access.reject_invite, { user })
  }

  public requestEA(user = "", isView: boolean): string {
    const type = this.eaTypeNam(isView)
    return this.translate(this.tl.push_noti.emergency_access.request, { user, type })
  }

  public requestResponseEA(user = "", isAccept: boolean, isView: boolean): string {
    const type = this.eaTypeNam(isView)
    return isAccept
      ? this.translate(this.tl.push_noti.emergency_access.accept_request, { user, type })
      : this.translate(this.tl.push_noti.emergency_access.reject_request, { user, type })
  }
}
