import { EventRegister } from "react-native-event-listeners"

import { TEMP_PREFIX } from "app/static/constants"

export enum AppEventType {
  PASSWORD_UPDATE = "PASSWORD_UPDATE",
  TEMP_ID_DECTECTED = "TEMP_ID_DECTECTED",
  NEW_BATCH_DECRYPTED = "NEW_BATCH_DECRYPTED",
  DECRYPT_ALL_STATUS = "DECRYPT_ALL_STATUS",
  CLOSE_ALL_MODALS = "CLOSE_ALL_MODALS",
  CLEAR_ALL_DATA = "CLEAR_ALL_DATA",

  /**
   * Private Relay
   */
  PRIVATE_RELAY_DELETE = "PRIVATE_RELAY_DELETE",
  PRIVATE_RELAY_DOMAIN_EDIT = "PRIVATE_RELAY_DOMAIN_EDIT",
  PRIVATE_RELAY_DOMAIN_CREATE = "PRIVATE_RELAY_DOMAIN_CREATE",
  PRIVATE_RELAY_UPDATE = "PRIVATE_RELAY_UPDATE",

  /**
   * Invite to family
   */
  INVITE_TO_FAMILY_MEMBER_UPDATE = "INVITE_TO_FAMILY_MEMBER_UPDATE",

  /**
   * Cipher edit screens
   */
  CIPHER_EDIT_HIDE_EMAIL = "CIPHER_EDIT_HIDE_EMAIL",
  CIPHER_EDIT_GENERATE_PASSWORD = "CIPHER_EDIT_GENERATE_PASSWORD",
  CIPHER_EDIT_OTP_SELECT = "CIPHER_EDIT_OTP_SELECT",
  CIPHER_EDIT_FOLDER_SELECT = "CIPHER_EDIT_FOLDER_SELECT",

  /**
   * Manage share member
   */
  MANAGE_SHARE_MEMBER_UPDATE = "MANAGE_SHARE_MEMBER_UPDATE",

  /**
   * Unselection (home, cipherList)
   */
  UNSELECT_ALL = "UNSELECT_ALL",

  /**
   * Select Encryption Config used for master password setup and change
   */
  SELECT_ENCRYPTION_CONFIG = "SELECT_ENCRYPTION_CONFIG",
}

export class EventBus {
  static createListener(event: AppEventType, handler: (data: any) => void) {
    return EventRegister.addEventListener(event, handler)
  }

  static removeListener(listener: any) {
    EventRegister.removeEventListener(listener)
  }

  static emit(event: AppEventType, data: any) {
    EventRegister.emit(event, data)
  }
}

export const detectTempId = (ids: string[]) => {
  if (ids) {
    for (const id of ids) {
      if (id?.startsWith(TEMP_PREFIX)) {
        EventBus.emit(AppEventType.TEMP_ID_DECTECTED, null)
        return true
      }
    }
  }
  return false
}
