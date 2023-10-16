import { ApiResponse } from 'apisauce'
import { Api, api } from './api'
import { GeneralApiProblem, getGeneralApiProblem } from './apiProblem'
import {
  PasskeyAuthenticationRequest,
  PasskeyRegistrationRequest,
} from 'react-native-passkey/lib/typescript/Passkey'
import {
  AccountRecovery,
  LoginData,
  UseLoginMethod,
  LoginResult,
  SocialLogin,
  WebauthCredential,
  OnPremisePreloginData,
  AuthPasskeyRequest,
  EmailOtpRequestRequest,
  RegisterPasskeyOptionRequest,
  RegisterPasskeyRequest,
  RegisterRequest,
  ResetIDPasswordRequest,
  ResetIDPasswordWithCode,
  SetNewPasswordSocialLoginRequest,
  SocialLoginRequest,
  OnPremiseIdentifierData,
  OnpremisePreloginPayload,
} from 'app/static/types'
import { LoginMethod } from 'app/static/types/enum'
import { Logger } from 'app/utils/utils'

/**
 * Login to id.locker
 */

class IdApi {
  private api: Api = api

  // ID login
  async loginMethod(
    username: string
  ): Promise<{ kind: 'ok'; data: UseLoginMethod } | GeneralApiProblem> {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/sso/auth/method`, {
        username,
      })
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: 'ok', data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // ID login
  async login(
    payload: LoginData,
    deviceId: string,
    isOtp?: boolean
  ): Promise<{ kind: 'ok'; data: LoginResult } | GeneralApiProblem> {
    try {
      this.api.apisauce.deleteHeader('Authorization')
      this.api.apisauce.setHeader('device-id', deviceId)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/sso/auth${isOtp ? '/otp' : ''}`,
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: 'ok', data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // ID social login
  async socialLogin(
    payload: SocialLoginRequest,
    deviceId: string
  ): Promise<{ kind: 'ok'; data: SocialLogin } | GeneralApiProblem> {
    try {
      this.api.apisauce.deleteHeader('Authorization')
      this.api.apisauce.setHeader('device-id', deviceId)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/sso/auth/social', payload)

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: 'ok', data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // authentication PASSKEY
  async authPasskeyOptions(username: string): Promise<
    | {
        kind: 'ok'
        data: PasskeyAuthenticationRequest
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/sso/users/webauthn/auth/options',
        { username }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'unknown', temporary: true }
    }
  }

  async authPasskey(
    payload: AuthPasskeyRequest,
    deviceId?: string
  ): Promise<
    | {
        kind: 'ok'
        data: LoginResult
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.deleteHeader('Authorization')
      this.api.apisauce.setHeader('device-id', deviceId)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/sso/users/webauthn/auth',
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: 'ok', data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'unknown', temporary: true }
    }
  }

  // ID register
  async register(payload: RegisterRequest): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/sso/users', payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: 'ok' }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'unknown', temporary: true }
    }
  }

  // register PASSKEY
  async registerPasskeyOptions(payload: RegisterPasskeyOptionRequest): Promise<
    | {
        kind: 'ok'
        data: PasskeyRegistrationRequest
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/sso/users/webauthn/register/options',
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'unknown', temporary: true }
    }
  }

  async registerPasskey(payload: RegisterPasskeyRequest): Promise<
    | {
        kind: 'ok'
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/sso/users/webauthn/register',
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: 'ok' }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'unknown', temporary: true }
    }
  }

  // Get email OTP
  async sendOtpEmail(
    payload: EmailOtpRequestRequest
  ): Promise<{ kind: 'ok'; success: boolean } | GeneralApiProblem> {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/sso/auth/otp/mail', payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', success: response.data.success }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // Account recovery
  async recoverAccount(payload: { username: string }): Promise<
    | {
        kind: 'ok'
        data: AccountRecovery[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/sso/users/account_recovery',
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // Reset ID password
  async resetPassword(
    payload: ResetIDPasswordRequest
  ): Promise<{ kind: 'ok'; success: boolean } | GeneralApiProblem> {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/sso/users/reset_password',
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', success: response.data.success }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // Reset ID password with code
  async resetPasswordWithCode(payload: ResetIDPasswordWithCode): Promise<
    | {
        kind: 'ok'
        data: {
          reset_password_url: string
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/sso/users/reset_password/token',
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // Set new ID password
  async setNewPassword(payload: {
    new_password: string
    token: string
  }): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/sso/users/new_password',
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok' }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // Set new ID password when signup by using social login
  async setPassword(payload: SetNewPasswordSocialLoginRequest): Promise<
    | {
        kind: 'ok'
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.deleteHeader('Authorization')

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/sso/new_password', payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok' }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  async webAuthListCredentials(
    token: string,
    paging: number
  ): Promise<
    | {
        kind: 'ok'
        data: WebauthCredential[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/sso/users/me/webauthn/list?paging=${paging}`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: 'ok', data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // Logout
  async logout(token: string): Promise<
    | {
        kind: 'ok'
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/users/logout')
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok' }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'rejected' }
    }
  }

  async businessLoginMethod(): Promise<
    | {
        kind: 'ok'
        data: {
          login_method: LoginMethod
        }
      }
    | GeneralApiProblem
  > {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `cystack_platform/pm/users/me/login_method`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  async onPremisePreLogin(preLoginPayload: OnpremisePreloginPayload): Promise<
    | {
        kind: 'ok'
        data: OnPremisePreloginData[]
      }
    | GeneralApiProblem
  > {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/users/onpremise/prelogin`,
        preLoginPayload
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  async onPremiseIdentifier(identifier: string): Promise<
    | {
        kind: 'ok'
        data: OnPremiseIdentifierData
      }
    | GeneralApiProblem
  > {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/users/onpremise/identifier`,
        { identifier }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }
}

export const idApi = new IdApi()
