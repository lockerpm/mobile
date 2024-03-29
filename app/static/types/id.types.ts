import { LoginMethod } from "./enum"

export type UseLoginMethod = {
  webauthn: boolean
  is_random_password: boolean
}

export type LoginResult = {
  token?: string
  is_factor2?: boolean
  methods?: {
    type: string
    data: any
  }[]
}

export type LoginData = {
  username: string
  password: string
  method?: string
  otp?: string
  save_device?: boolean
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
  type: string
  data: any
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

export type PreloginUserSnapshot = {
  email: string
  name: string
  avatar: string
  activated: boolean
  set_up_passwordless: boolean
  login_method: LoginMethod
  require_passwordless: boolean
}