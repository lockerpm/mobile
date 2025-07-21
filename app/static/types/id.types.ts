import { PasskeyGetResult, PasskeyCreateResult } from "react-native-passkey"
import { User2FAMethod } from "./user.types"

export type UseLoginMethod = {
  webauthn: boolean
  is_random_password: boolean
  has_social_login: boolean
}

export type LoginResult = {
  token?: string
  is_factor2?: boolean
  methods?: User2FAMethod[]
}

export type LoginData = {
  username: string
  password: string
  method?: string
  otp?: string
  save_device?: boolean
}

export type LoginPinCodeData = {
  nonce: string
  code: string
  method?: string
  otp?: string
  save_device?: boolean
}

export type SocialLogin = {
  is_first?: boolean
  new_user?: boolean
  token: string
  tmp_token?: string
}

export type WebauthCredential = {
  id: string
  created_time: number
  webauthn_credential_id: string
  webauthn_public_key: string
  name: string
  last_used_time: number
}

export type AccountRecovery = {
  type: "mail"
  data: string[]
}

export type OnPremisePreloginData = {
  activated: boolean
  alias: string
  avatar: string
  base_api: string
  login_method: "password" | "passwordless" | string
  email: string
  require_passwordless: boolean
  set_up_passwordless: boolean
}

export type AuthPasskeyRequest = {
  username: string
  response: PasskeyGetResult
}

export type SocialLoginRequest = {
  provider: string
  access_token?: string
  code?: string
  scope?: string
  utm_source?: string
}

export type RegisterRequest = {
  email: string
  password: string
  confirm_password: string
  full_name: string
  country: string
  phone?: string
  keep_me_updated?: boolean
  request_code: string
  scope: string
  utm_source?: string
}

export type RegisterPasskeyOptionRequest = {
  algorithms: string[]
  email: string
  full_name: string
}

export type RegisterPasskeyRequest = RegisterRequest & {
  response: PasskeyCreateResult & {
    authenticatorAttachment: string
  }
}

export type EmailOtpRequestRequest = {
  username: string
  password: string
  request_code: string
}

export type ResetIDPasswordRequest = {
  username: string
  method: string
  request_code: string
}

export type ResetIDPasswordWithCode = {
  username: string
  code: string
}

export type SetNewPasswordSocialLoginRequest = {
  new_password: string
  token: string
  username: string
}
