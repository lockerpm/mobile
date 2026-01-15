import { Platform } from "react-native"
import { ApiResponse } from "apisauce"
import { Purchase, PurchaseAndroid, PurchaseIOS } from "react-native-iap"

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
  MarketingContent,
  ChatWootUser,
  User2FAMethod,
  UserIDType,
  UserLockerType,
} from "app/static/types"
import { PolicyType } from "app/static/types/enum"
import { CipherResponse } from "core/models/response/cipherResponse"

import { Logger } from "@/utils/logger"

import { Api, api } from "./api"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"

const IS_IOS = Platform.OS === "ios"

class UserApi {
  private api: Api = api

  // --------------------- ID -----------------------------

  // Get me
  async getUser(token: string): Promise<{ kind: "ok"; user: UserIDType } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get("/v3/me")
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const user = response.data
      return { kind: "ok", user }
    } catch (e) {
      Logger.error("getUser", e)
      return { kind: "bad-data" }
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
        kind: "ok"
        data: {
          url: string
          access_token: string

          // Clone data here to hide error
          // These data actually not exists
          is_factor2?: boolean
          methods?: User2FAMethod[]
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      this.api.apisauce.setHeader("device-id", deviceId)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/sso/access_token",
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error("getPMToken", e)
      return { kind: "bad-data" }
    }
  }

  // Get master password hint
  async sendMasterPasswordHint(
    token: string,
    payload: { email: string }
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/password_hint",
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("sendMasterPasswordHint", e)
      return { kind: "bad-data" }
    }
  }

  // Get user info from PM
  async getUserPw(
    token: string
  ): Promise<{ kind: "ok"; user: UserLockerType } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/users/me"
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const user = response.data

      return { kind: "ok", user }
    } catch (e) {
      Logger.error("getUserPw", e)
      return { kind: "bad-data" }
    }
  }

  async hideUserMassterPassword(
    token: string,
    hide: boolean
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        "/v3/cystack_platform/pm/users/me",
        {
          hide_master_password: hide,
        }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("hideUserMassterPassword", e)
      return { kind: "bad-data" }
    }
  }

  async getEnterprise(
    token: string
  ): Promise<{ kind: "ok"; data: Enterprise[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/enterprises"
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("getEnterprise", e)
      return { kind: "bad-data" }
    }
  }

  async setUserLanguage(
    token: string,
    language: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put("/v3/me", {
        customer_language: language,
      })
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("setUserLanguage", e)
      return { kind: "bad-data" }
    }
  }

  // Session login
  async sessionLogin(
    token: string,
    payload: SessionLoginRequest
  ): Promise<{ kind: "ok"; data: SessionSnapshot } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/session",
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data
      return { kind: "ok", data }
    } catch (e) {
      Logger.error("sessionLogin", e)
      return { kind: "bad-data" }
    }
  }

  // Session login
  async sessionOtpLogin(
    token: string,
    payload: SessionOtpLoginRequest
  ): Promise<{ kind: "ok"; data: SessionSnapshot } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/session/otp",
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data
      return { kind: "ok", data }
    } catch (e) {
      Logger.error("sessionOtpLogin", e)
      return { kind: "bad-data" }
    }
  }

  // Create new master password
  async registerLocker(
    token: string,
    payload: RegisterLockerRequest
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/register",
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("registerLocker", e)
      return { kind: "bad-data" }
    }
  }

  // Change master password
  async changeMasterPassword(
    token: string,
    payload: ChangePasswordRequest
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/me/password",
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("changeMasterPassword", e)
      return { kind: "bad-data" }
    }
  }

  // Get teams
  async getTeams(token: string): Promise<{ kind: "ok"; teams: UserTeam[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/teams"
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const teams = response.data

      return { kind: "ok", teams }
    } catch (e) {
      Logger.error("getTeams", e)
      return { kind: "bad-data" }
    }
  }

  // Get plan
  async getPlan(token: string): Promise<
    | {
        kind: "ok"
        data: UserPlan
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/payments/plan"
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error("getPlan", e)
      return { kind: "bad-data" }
    }
  }

  // Get invitations
  async getInvitations(token: string): Promise<
    | {
        kind: "ok"
        data: UserInvitations[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/users/invitations"
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error("getInvitations", e)
      return { kind: "bad-data" }
    }
  }

  // Respond to an invitation
  async invitationRespond(
    token: string,
    id: string,
    status: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/v3/cystack_platform/pm/users/invitations/${id}`,
        {
          status,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("invitationRespond", e)
      return { kind: "bad-data" }
    }
  }

  // Deauthorize all sessions
  async deauthorizeSessions(
    token: string,
    hashedPassword: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/session/revoke_all",
        {
          master_password_hash: hashedPassword,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("deauthorizeSessions", e)
      return { kind: "bad-data" }
    }
  }

  // Purge account
  async purgeAccount(
    token: string,
    hashedPassword: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/me/purge",
        {
          master_password_hash: hashedPassword,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("purgeAccount", e)
      return { kind: "bad-data" }
    }
  }

  async getReferLink(
    token: string
  ): Promise<{ kind: "ok"; data: { referral_link: string } } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/referrals"
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("getReferLink", e)
      return { kind: "bad-data" }
    }
  }

  async getNotificationSettings(
    token: string
  ): Promise<{ kind: "ok"; data: NotificationSettingData[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/notification/settings",
        { type: "notification" }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("getNotificationSettings", e)
      return { kind: "bad-data" }
    }
  }

  async updateNotiSettings(
    token: string,
    categoryId: string,
    mail: boolean,
    notification: boolean
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/v3/cystack_platform/pm/notification/settings/${categoryId}`,
        { mail, notification }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("updateNotiSettings", e)
      return { kind: "bad-data" }
    }
  }

  // Delete account
  async deleteAccount(
    token: string,
    hashedPassword: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/me/delete",
        {
          master_password_hash: hashedPassword,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("deleteAccount", e)
      return { kind: "bad-data" }
    }
  }

  // Get all policies
  async getTeamPolicies(
    token: string,
    organizationId: string
  ): Promise<{ kind: "ok"; data: TeamPolicies } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/v3/cystack_platform/pm/enterprises/${organizationId}/policy`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error("getTeamPolicies", e)
      return { kind: "bad-data" }
    }
  }

  // Get a specific policy
  async getTeamPolicy(
    token: string,
    organizationId: string,
    policyType: PolicyType
  ): Promise<
    | {
        kind: "ok"
        data: PasswordPolicy | MasterPasswordPolicy | BlockFailedLoginPolicy | PasswordlessPolicy
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/v3/cystack_platform/pm/enterprises/${organizationId}/policy/${policyType}`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error("getTeamPolicy", e)
      return { kind: "bad-data" }
    }
  }

  // Send feedback
  async sendFeedback(
    token: string,
    payload: FeedbackRequest
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/feedback",
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("sendFeedback", e)
      return { kind: "bad-data" }
    }
  }

  // Update FCM
  async updateFCM(
    token: string,
    payload: UpdateFCMRequest
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/me/fcm_id",
        payload
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("updateFCM", e)
      return { kind: "bad-data" }
    }
  }

  // Get Billing Documents
  async getBillingDocuments(
    token: string,
    page: number
  ): Promise<
    | {
        kind: "ok"
        data: Billing[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/payments/invoices",
        { page }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data.results }
    } catch (e) {
      Logger.error("getBillingDocuments", e)
      return { kind: "bad-data" }
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
        kind: "ok"
        data: {
          success: boolean
          detail: string
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      let response: ApiResponse<any>
      // make the api call
      if (IS_IOS) {
        // if (originalTransactionIdentifierIOS) {
        response = await this.api.apisauce.post("/v3/payments/webhook/ios/validate", {
          scope: "pwdmanager",
          receipt_data: receipt,
          original_transaction_id: originalTransactionIdentifierIOS,
        })
      } else {
        response = await this.api.apisauce.post("/v3/payments/webhook/android/validate", {
          scope: "pwdmanager",
          receipt_data: { token: receipt, plan_id: subscriptionId },
        })
      }
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("purchaseValidation", e)
      return { kind: "bad-data" }
    }
  }

  async purchaseValidationV2(
    token: string,
    purchase: Purchase
  ): Promise<
    | {
        kind: "ok"
        data: {
          success: boolean
          detail: any
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      let response: ApiResponse<any>
      // make the api call
      if (IS_IOS) {
        const purchaseIos = purchase as PurchaseIOS
        response = await this.api.apisauce.post("/v3/payments/webhook/ios_v2/validate", {
          scope: "pwdmanager",
          transaction_id: purchaseIos.transactionId,
          original_transaction_id: purchaseIos.originalTransactionIdentifierIOS,
        })
      } else {
        const purchaseAndroid = purchase as PurchaseAndroid
        response = await this.api.apisauce.post("/v3/payments/webhook/android_v2/validate", {
          scope: "pwdmanager",
          receipt_data: {
            token: purchaseAndroid.purchaseToken,
            plan_id: purchaseAndroid.productId,
          },
        })
      }
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("purchaseValidation v2", e)
      return { kind: "bad-data" }
    }
  }

  async getFamilyMember(token: string): Promise<
    | {
        kind: "ok"
        data: FamilyMember[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/family/members"
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("getFamilyMember", e)
      return { kind: "bad-data" }
    }
  }

  async addFamilyMember(
    token: string,
    emailMembers: string[]
  ): Promise<{ kind: "ok"; data: any } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/family/members",
        { family_members: emailMembers }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e: any) {
      Logger.error("addFamilyMember", e)
      return { kind: "bad-data", data: e.message.code }
    }
  }

  async removeFamilyMember(
    token: string,
    memberId: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        "/v3/cystack_platform/pm/family/members/" + memberId
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("removeFamilyMember", e)
      return { kind: "bad-data" }
    }
  }

  async getTrialEligible(token: string): Promise<
    | {
        kind: "ok"
        data: {
          personal_trial_applied: boolean
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/payments/webhook/trial",
        {
          scope: "pwdmanager",
        }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("getTrialEligible", e)
      return { kind: "bad-data" }
    }
  }

  // ---------------- EMERGENCY ACCESS ------------------------

  async EAInvite(
    token: string,
    email: string,
    key: string,
    type: string,
    wait_time_days: number
  ): Promise<{ kind: "ok"; data: { is: string } } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/v3/cystack_platform/pm/emergency_access/invite`,
        { email, key, type, wait_time_days }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("EAInvite", e)
      return { kind: "bad-data" }
    }
  }

  async EATrusted(
    token: string
  ): Promise<{ kind: "ok"; data: TrustedContact[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/v3/cystack_platform/pm/emergency_access/trusted`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("EATrusted", e)
      return { kind: "bad-data" }
    }
  }

  async EAGranted(
    token: string
  ): Promise<{ kind: "ok"; data: TrustedContact[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/v3/cystack_platform/pm/emergency_access/granted`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("EAGranted", e)
      return { kind: "bad-data" }
    }
  }

  async EATrustedYouAction(
    token: string,
    id: string,
    action: "accept" | "initiate"
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/v3/cystack_platform/pm/emergency_access/${id}/${action}`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("EATrustedYouAction", e)
      return { kind: "bad-data" }
    }
  }

  async EATakeover(
    token: string,
    id: string
  ): Promise<
    | {
        kind: "ok"
        data: {
          kdf: number
          kdf_iterations: number
          key_encrypted: string
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/v3/cystack_platform/pm/emergency_access/${id}/takeover`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("EATakeover", e)
      return { kind: "bad-data" }
    }
  }

  async EAView(
    token: string,
    id: string
  ): Promise<
    | {
        kind: "ok"
        data: {
          ciphers: CipherResponse[]
          key_encrypted: string
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/v3/cystack_platform/pm/emergency_access/${id}/view`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("EAView", e)
      return { kind: "bad-data" }
    }
  }

  async EAyourTrustedAction(
    token: string,
    id: string,
    action: "reject" | "approve" | "reinvite"
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/v3/cystack_platform/pm/emergency_access/${id}/${action}`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("EAyourTrustedAction", e)
      return { kind: "bad-data" }
    }
  }

  async EAPassword(
    token: string,
    id: string,
    payload: any
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/v3/cystack_platform/pm/emergency_access/${id}/password`,
        payload
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("EAPassword", e)
      return { kind: "bad-data" }
    }
  }

  async EALockerPassword(
    token: string,
    id: string,
    newPass: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/v3/cystack_platform/pm/emergency_access/${id}/id_password`,
        {
          new_password: newPass,
        }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("EALockerPassword", e)
      return { kind: "bad-data" }
    }
  }

  async EARemove(token: string, id: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        `/v3/cystack_platform/pm/emergency_access/${id}`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("EARemove", e)
      return { kind: "bad-data" }
    }
  }

  // marketing
  async fetchMarketingContent(
    token: string,
    language: string
  ): Promise<{ kind: "ok"; data: MarketingContent } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/v3/cystack_platform/pm/marketing/banner?language=${language}`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("fetchMarketingContent", e)
      return { kind: "bad-data" }
    }
  }

  async getChatWootIdHash(
    token: string
  ): Promise<{ kind: "ok"; data: ChatWootUser } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/v3/cystack_platform/pm/users/me/chatwoot`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("getChatWootIdHash", e)
      return { kind: "bad-data" }
    }
  }
}

export const userApi = new UserApi()
