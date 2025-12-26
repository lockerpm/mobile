import Config from "@/config"
import { Fido2SimpleView } from "@/static/types"

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

type IosAutofillTemporaryPasskeyItem = {
  // if id != "" -> add passkey to existing login (with this id)
  // if id == "" -> create new login with this passkey
  id: string
} & Fido2SimpleView

export type IosAutofillTemporaryPasskey = IosAutofillTemporaryPasskeyItem[]

export type IosAutofillPassword = {
  id: string
  name: string
  uri: string
  username: string
  password: string
  isOwner: boolean
  otp?: string
  fido2?: Fido2SimpleView[]
}[]

export enum StoreKey {
  USER_INFO = "USER_INFO",
  TEMP_PASSWORD = "TEMP_PASSWORD",
  PASSWORD = "PASSWORD",
  TEMP_PASSKEY = "TEMP_PASSKEY",
}

export const AutofillStorekey: Record<
  StoreKey,
  {
    service: string
    username: string
  }
> = {
  USER_INFO: {
    service: Config.SHARED_KEYCHAIN_SERVICE + ".info",
    username: "locker_info",
  },
  TEMP_PASSWORD: {
    service: Config.SHARED_KEYCHAIN_SERVICE + ".temp_password",
    username: "locker_temp_password",
  },
  PASSWORD: {
    service: Config.SHARED_KEYCHAIN_SERVICE + ".password",
    username: "locker_password",
  },
  TEMP_PASSKEY: {
    service: Config.SHARED_KEYCHAIN_SERVICE + ".temp_passkey",
    username: "locker_temp_passkey",
  },
}
