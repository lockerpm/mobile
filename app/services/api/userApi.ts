import { ApiResponse } from 'apisauce'
import { Api, api } from './api'
import { GeneralApiProblem, getGeneralApiProblem } from './apiProblem'
import { Logger } from '../../utils/utils'
import { IS_IOS } from '../../config/constants'
import {
  Billing,
  BlockFailedLoginPolicy,
  Enterprise,
  FamilyMember,
  GetPMTokenData,
  MasterPasswordPolicy,
  PasswordPolicy,
  PasswordlessPolicy,
  SessionSnapshot,
  TeamPolicies,
  TrustedContact,
  UserPlan,
  UserTeam,
  ChangePasswordRequest,
  FeedbackRequest,
  RegisterLockerRequest,
  SessionLoginRequest,
  SessionOtpLoginRequest,
  UpdateFCMRequest,
  UserInvitations,
  NotificationSettingData,
} from 'app/static/types'
import { CipherResponse } from 'core/models/response/cipherResponse'
import { PolicyType } from 'app/static/types/enum'
import { UserSnapshot } from 'app/models'

class UserApi {
  private api: Api = api

  // --------------------- ID -----------------------------

  // Get me
  async getUser(token: string): Promise<{ kind: 'ok'; user: UserSnapshot } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get('/me')
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const user = response.data
      return { kind: 'ok', user }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // --------------------- LOCKER -----------------------------

  // Get PM API token
  async getPMToken(
    token: string,
    payload: GetPMTokenData,
    deviceId: string
  ): Promise<
    | {
        kind: 'ok'
        data: {
          url: string
          access_token: string

          // Clone data here to hide error
          // These data actually not exists
          is_factor2?: boolean
          methods?: {
            type: string
            data: any
          }[]
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      this.api.apisauce.setHeader('device-id', deviceId)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/sso/access_token', payload)
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

  // Get master password hint
  async sendMasterPasswordHint(
    token: string,
    payload: { email: string }
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/users/password_hint',
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

  // Get user info from PM
  async getUserPw(token: string): Promise<{ kind: 'ok'; user: UserSnapshot } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        '/cystack_platform/pm/users/me'
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const user = response.data

      return { kind: 'ok', user }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  async getEnterprise(
    token: string
  ): Promise<{ kind: 'ok'; data: Enterprise[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        '/cystack_platform/pm/enterprises'
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

  async setUserLanguage(
    token: string,
    language: string
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put('/me', { language })
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

  // Session login
  async sessionLogin(
    token: string,
    payload: SessionLoginRequest
  ): Promise<{ kind: 'ok'; data: SessionSnapshot } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/users/session',
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

  // Session login
  async sessionOtpLogin(
    token: string,
    payload: SessionOtpLoginRequest
  ): Promise<{ kind: 'ok'; data: SessionSnapshot } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/users/session/otp',
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

  // Create new master password
  async registerLocker(
    token: string,
    payload: RegisterLockerRequest
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/users/register',
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

  // Change master password
  async changeMasterPassword(
    token: string,
    payload: ChangePasswordRequest
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/users/me/password',
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

  // Get teams
  async getTeams(token: string): Promise<{ kind: 'ok'; teams: UserTeam[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get('/cystack_platform/pm/teams')
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const teams = response.data

      return { kind: 'ok', teams }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // Get plan
  async getPlan(
    token: string
  ): Promise<
    | {
        kind: 'ok'
        data: UserPlan
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        '/cystack_platform/pm/payments/plan'
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

  // Get invitations
  async getInvitations(
    token: string
  ): Promise<
    | {
        kind: 'ok'
        data: UserInvitations[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        '/cystack_platform/pm/users/invitations'
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

  // Respond to an invitation
  async invitationRespond(
    token: string,
    id: string,
    status: string
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/users/invitations/${id}`,
        {
          status,
        }
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

  // Deauthorize all sessions
  async deauthorizeSessions(
    token: string,
    hashedPassword: string
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/users/session/revoke_all',
        {
          master_password_hash: hashedPassword,
        }
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

  // Purge account
  async purgeAccount(
    token: string,
    hashedPassword: string
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/users/me/purge',
        {
          master_password_hash: hashedPassword,
        }
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

  async getReferLink(
    token: string
  ): Promise<{ kind: 'ok'; data: { referral_link: string } } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        '/cystack_platform/pm/referrals'
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

  async getNotificationSettings(
    token: string
  ): Promise<{ kind: 'ok'; data: NotificationSettingData[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        '/cystack_platform/pm/notifcation/settings',
        { type: 'notification' }
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

  async updateNotiSettings(
    token: string,
    categoryId: string,
    mail: boolean,
    notification: boolean
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/notifcation/settings/${categoryId}`,
        { mail, notification }
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

  // Delete account
  async deleteAccount(
    token: string,
    hashedPassword: string
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/users/me/delete',
        {
          master_password_hash: hashedPassword,
        }
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

  // Get all policies
  async getTeamPolicies(
    token: string,
    organizationId: string
  ): Promise<{ kind: 'ok'; data: TeamPolicies } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/enterprises/${organizationId}/policy`
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

  // Get a specific policy
  async getTeamPolicy(
    token: string,
    organizationId: string,
    policyType: PolicyType
  ): Promise<
    | {
        kind: 'ok'
        data: PasswordPolicy | MasterPasswordPolicy | BlockFailedLoginPolicy | PasswordlessPolicy
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/enterprises/${organizationId}/policy/${policyType}`
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

  // Send feedback
  async sendFeedback(
    token: string,
    payload: FeedbackRequest
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/feedback',
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

  // Update FCM
  async updateFCM(
    token: string,
    payload: UpdateFCMRequest
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/users/me/fcm_id',
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

  // Get Billing Documents
  async getBillingDocuments(
    token: string,
    page: number
  ): Promise<
    | {
        kind: 'ok'
        data: Billing[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        '/cystack_platform/pm/payments/invoices',
        { page: page }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: 'ok', data: response.data.results }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // Get Billing Documents
  async purchaseValidation(
    token: string,
    receipt?: string,
    subscriptionId?: string,
    originalTransactionIdentifierIOS?: string
  ): Promise<
    | {
        kind: 'ok'
        data: {
          success: boolean
          detail: string
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      let response: ApiResponse<any>
      // make the api call
      if (IS_IOS) {
        // if (originalTransactionIdentifierIOS) {
        response = await this.api.apisauce.post('/payments/webhook/ios/validate', {
          scope: 'pwdmanager',
          receipt_data: receipt,
          original_transaction_id: originalTransactionIdentifierIOS,
        })
      } else {
        response = await this.api.apisauce.post('/payments/webhook/android/validate', {
          scope: 'pwdmanager',
          receipt_data: { token: receipt, plan_id: subscriptionId },
        })
      }
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

  async getFamilyMember(
    token: string
  ): Promise<
    | {
        kind: 'ok'
        data: FamilyMember[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        '/cystack_platform/pm/family/members'
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

  async addFamilyMember(
    token: string,
    emailMembers: string[]
  ): Promise<{ kind: 'ok'; data: any } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/family/members',
        { family_members: emailMembers }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data', data: e.message.code }
    }
  }

  async removeFamilyMember(
    token: string,
    memberId: string
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        '/cystack_platform/pm/family/members/' + memberId
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

  async getTrialEligible(
    token: string
  ): Promise<
    | {
        kind: 'ok'
        data: {
          personal_trial_applied: boolean
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post('/payments/webhook/trial', {
        scope: 'pwdmanager',
      })

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

  // ---------------- EMERGENCY ACCESS ------------------------

  async EAInvite(
    token: string,
    email: string,
    key: string,
    type: string,
    wait_time_days: number
  ): Promise<{ kind: 'ok'; data: { is: string } } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/invite`,
        { email, key, type, wait_time_days }
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

  async EATrusted(
    token: string
  ): Promise<{ kind: 'ok'; data: TrustedContact[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/emergency_access/trusted`
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

  async EAGranted(
    token: string
  ): Promise<{ kind: 'ok'; data: TrustedContact[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/emergency_access/granted`
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

  async EATrustedYouAction(
    token: string,
    id: string,
    action: 'accept' | 'initiate'
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/${action}`
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

  async EATakeover(
    token: string,
    id: string
  ): Promise<
    | {
        kind: 'ok'
        data: {
          kdf: number
          kdf_iterations: number
          key_encrypted: string
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/takeover`
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

  async EAView(
    token: string,
    id: string
  ): Promise<
    | {
        kind: 'ok'
        data: {
          ciphers: CipherResponse[]
          key_encrypted: string
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/view`
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

  async EAyourTrustedAction(
    token: string,
    id: string,
    action: 'reject' | 'approve' | 'reinvite'
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/${action}`
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

  async EAPassword(
    token: string,
    id: string,
    payload: any
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/password`,
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

  async EALockerPassword(
    token: string,
    id: string,
    newPass: string
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/id_password`,
        {
          new_password: newPass,
        }
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

  async EARemove(token: string, id: string): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        `/cystack_platform/pm/emergency_access/${id}`
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
}

export const userApi = new UserApi()
