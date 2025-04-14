import { SHARED_KEYCHAIN_SERVICE } from "app/config/constants"

export type AutofillUserInfo = {
  email: string
  avatar: string
  hashPass: string
  token: string
  language: string

  faceIdEnabled: boolean
  isFree: boolean
}

export type IosAutofillTemporaryPassword = {
  username: string
  password: string
  name: string
  uri: string
}[]

export type IosAutofillPassword = {
  id: string
  name: string
  uri: string
  username: string
  password: string
  isOwner: boolean
  otp?: string
}[]

export enum StoreKey {
  USER_INFO = "USER_INFO",
  TEMP_PASSWORD = "TEMP_PASSWORD",
  PASSWORD = "PASSWORD",
}

export const AutofillStorekey: Record<
  StoreKey,
  {
    service: string
    username: string
  }
> = {
  USER_INFO: {
    service: SHARED_KEYCHAIN_SERVICE + ".info",
    username: "locker_info",
  },
  TEMP_PASSWORD: {
    service: SHARED_KEYCHAIN_SERVICE + ".temp_password",
    username: "locker_temp_password",
  },
  PASSWORD: {
    service: SHARED_KEYCHAIN_SERVICE + ".password",
    username: "locker_password",
  },
}
// SHARED_KEYCHAIN_SERVICE = 'W7S57TNBH5.com.cystack.lockerapp'