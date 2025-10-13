import Config from "@/config"

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

export type IosFido2SimpleView = {
  credentialId: string // Base64URL
  keyValue: string // Base64URL
  rpId: string
  userHandle: string // Base64URL
  userName: string
  creationDate: string
}

type IosAutofillTemporaryPasskeyItem = {
  // if id != "" -> add passkey to existing login (with this id)
  // if id == "" -> create new login with this passkey
  id: string
} & IosFido2SimpleView

export type IosAutofillTemporaryPasskey = IosAutofillTemporaryPasskeyItem[]

export type IosAutofillPassword = {
  id: string
  name: string
  uri: string
  username: string
  password: string
  isOwner: boolean
  otp?: string
  fido2?: IosFido2SimpleView[]
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
