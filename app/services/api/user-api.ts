import { ApiResponse } from "apisauce"
import {
  GetUserResult,
  EmptyResult,
  SessionLoginData,
  SessionLoginResult,
  PasswordHintRequestData,
  RegisterLockerData,
  GetTeamsResult,
  GetPlanResult,
  ChangePasswordData,
  LoginData,
  LoginResult,
  EmailOtpRequestData,
  EmailOtpResult,
  AccountRecoveryResult,
  ResetPasswordResult,
  ResetPasswordWithCodeResult,
  SocialLoginResult,
  RegisterData,
  GetInvitationsResult,
  BillingResult,
  PurchaseValidationResult,
  FamilyMemberResult,
  AddMemberResult,
  RemoveMemberResult,
  GetReferLinkResult,
  FeedbackData,
  GetPMTokenResult,
  GetPMTokenData,
  UpdateFCMData,
  GetTrialEligibleResult,
  SocialLoginData,
  GetNotificationSettings,
  UpdateNotiSettingsResult,
  FetchInappNotiResult,
  TrustedResult,
  EAInviteResult,
  EATakeoverResult,
  EAViewResult,
  GetTeamPoliciesResult,
  GetTeamPolicyResult,
  GetEnterpriseResult,
  OnPremisePreLoginResult,
  SessionOtpLoginData,
  BusinessLoginMethodResult,
  OnPremiseIdentifierResult,
  OnpremisePreloginPayload,
} from "./api.types"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { Logger } from "../../utils/logger"
import { IS_IOS } from "../../config/constants"
import { PolicyType } from "../../config/types"

export class UserApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  // --------------------- ID -----------------------------

  // Get me
  async getUser(token: string): Promise<GetUserResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get("/me")
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const user = response.data
      return { kind: "ok", user }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // ID login
  async login(payload: LoginData, deviceId: string, isOtp?: boolean): Promise<LoginResult> {
    try {
      this.api.apisauce.deleteHeader("Authorization")
      this.api.apisauce.setHeader("device-id", deviceId)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/sso/auth${isOtp ? "/otp" : ""}`,
        payload,
      )

      
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // ID social login
  async socialLogin(payload: SocialLoginData, deviceId: string): Promise<SocialLoginResult> {
    try {
      this.api.apisauce.deleteHeader("Authorization")
      this.api.apisauce.setHeader("device-id", deviceId)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post("/sso/auth/social", payload)

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // ID register
  async register(payload: RegisterData): Promise<EmptyResult> {
    try {
      this.api.apisauce.deleteHeader("Authorization")

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post("/sso/users", payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "unknown", temporary: true }
    }
  }

  // Logout
  async logout(token: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post("/users/logout")
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "rejected" }
    }
  }

  // Get email OTP
  async sendOtpEmail(payload: EmailOtpRequestData): Promise<EmailOtpResult> {
    try {
      this.api.apisauce.deleteHeader("Authorization")

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post("/sso/auth/otp/mail", payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", success: response.data.success }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Account recovery
  async recoverAccount(payload: { username: string }): Promise<AccountRecoveryResult> {
    try {
      this.api.apisauce.deleteHeader("Authorization")

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/sso/users/account_recovery",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Reset ID password
  async resetPassword(payload: {
    username: string
    method: string
    request_code: string
  }): Promise<ResetPasswordResult> {
    try {
      this.api.apisauce.deleteHeader("Authorization")

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/sso/users/reset_password",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", success: response.data.success }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Reset ID password with code
  async resetPasswordWithCode(payload: {
    username: string
    code: string
  }): Promise<ResetPasswordWithCodeResult> {
    try {
      this.api.apisauce.deleteHeader("Authorization")

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/sso/users/reset_password/token",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Set new ID password
  async setNewPassword(payload: { new_password: string; token: string }): Promise<EmptyResult> {
    try {
      this.api.apisauce.deleteHeader("Authorization")

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/sso/users/new_password",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Set new ID password when signup by using social login
  async setPassword(payload: {
    new_password: string
    token: string
    username: string
  }): Promise<EmptyResult> {
    try {
      this.api.apisauce.deleteHeader("Authorization")

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post("/sso/new_password", payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // --------------------- LOCKER -----------------------------

  // Get PM API token
  async getPMToken(token: string, payload: GetPMTokenData, deviceId: string): Promise<GetPMTokenResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      this.api.apisauce.setHeader("device-id", deviceId)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post("/sso/access_token", payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get master password hint
  async sendMasterPasswordHint(
    token: string,
    payload: PasswordHintRequestData,
  ): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/users/password_hint",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get user info from PM
  async getUserPw(token: string): Promise<GetUserResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/cystack_platform/pm/users/me",
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const user = response.data

      return { kind: "ok", user }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async getEnterprise(token: string): Promise<GetEnterpriseResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/cystack_platform/pm/enterprises",
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async setUserLanguage(token: string, language: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put("/me", { language })
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Session login
  async sessionLogin(token: string, payload: SessionLoginData): Promise<SessionLoginResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/users/session",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data
      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Session login
  async sessionOtpLogin(token: string, payload: SessionOtpLoginData): Promise<SessionLoginResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/users/session/otp",
        payload,
      )


      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data
      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Create new master password
  async registerLocker(token: string, payload: RegisterLockerData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/users/register",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Change master password
  async changeMasterPassword(token: string, payload: ChangePasswordData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/users/me/password",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get teams
  async getTeams(token: string): Promise<GetTeamsResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get("/cystack_platform/pm/teams")
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const teams = response.data

      return { kind: "ok", teams }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get plan
  async getPlan(token: string): Promise<GetPlanResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/cystack_platform/pm/payments/plan",
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get invitations
  async getInvitations(token: string): Promise<GetInvitationsResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/cystack_platform/pm/users/invitations",
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Respond to an invitation
  async invitationRespond(token: string, id: string, status: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/users/invitations/${id}`,
        {
          status,
        },
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Deauthorize all sessions
  async deauthorizeSessions(token: string, hashedPassword: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/users/session/revoke_all",
        {
          master_password_hash: hashedPassword,
        },
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Purge account
  async purgeAccount(token: string, hashedPassword: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/users/me/purge",
        {
          master_password_hash: hashedPassword,
        },
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Delete account
  async deleteAccount(token: string, hashedPassword: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/users/me/delete",
        {
          master_password_hash: hashedPassword,
        },
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get all policies
  async getTeamPolicies(token: string, organizationId: string): Promise<GetTeamPoliciesResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/enterprises/${organizationId}/policy`,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get a specific policy
  async getTeamPolicy(
    token: string,
    organizationId: string,
    policyType: PolicyType,
  ): Promise<GetTeamPolicyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/enterprises/${organizationId}/policy/${policyType}`,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Send feedback
  async sendFeedback(token: string, payload: FeedbackData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/feedback",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Update FCM
  async updateFCM(token: string, payload: UpdateFCMData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/users/me/fcm_id",
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get Billing Documents
  async getBillingDocuments(token: string, page: number): Promise<BillingResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/cystack_platform/pm/payments/invoices",
        { page: page },
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data.results }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get Billing Documents
  async purchaseValidation(
    token: string,
    receipt?: string,
    subscriptionId?: string,
    originalTransactionIdentifierIOS?: string,
  ): Promise<PurchaseValidationResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      let response: ApiResponse<any>
      // make the api call
      if (IS_IOS) {
        // if (originalTransactionIdentifierIOS) {
        response = await this.api.apisauce.post("/payments/webhook/ios/validate", {
          scope: "pwdmanager",
          receipt_data: receipt,
          original_transaction_id: originalTransactionIdentifierIOS,
        })
      } else {
        response = await this.api.apisauce.post("/payments/webhook/android/validate", {
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
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async getFamilyMember(token: string): Promise<FamilyMemberResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/cystack_platform/pm/family/members",
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async addFamilyMember(token: string, emailMembers: string[]): Promise<AddMemberResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/family/members",
        { family_members: emailMembers },
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data", data: e.message.code }
    }
  }

  async removeFamilyMember(token: string, memberId: string): Promise<RemoveMemberResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        "/cystack_platform/pm/family/members/" + memberId,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async getReferLink(token: string): Promise<GetReferLinkResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/cystack_platform/pm/referrals",
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async getTrialEligible(token: string): Promise<GetTrialEligibleResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post("/payments/webhook/trial", {
        scope: "pwdmanager",
      })

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async getNotificationSettings(token: string): Promise<GetNotificationSettings> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/cystack_platform/pm/notifcation/settings",
        { type: "notification" },
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async updateNotiSettings(
    token: string,
    categoryId: string,
    mail: boolean,
    notification: boolean,
  ): Promise<UpdateNotiSettingsResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/notifcation/settings/${categoryId}`,
        { mail, notification },
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async fetchInAppNoti(token: string): Promise<FetchInappNotiResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/notifications?scope=pwdmanager`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async markReadInappNoti(token: string, id: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.put(`/notifications/${id}`, {
        read: true,
      })

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EAInvite(
    token: string,
    email: string,
    key: string,
    type: string,
    wait_time_days: number,
  ): Promise<EAInviteResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/invite`,
        { email, key, type, wait_time_days },
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EATrusted(token: string): Promise<TrustedResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/emergency_access/trusted`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EAGranted(token: string): Promise<TrustedResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/emergency_access/granted`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EATrustedYouAction(
    token: string,
    id: string,
    action: "accept" | "initiate",
  ): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/${action}`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EATakeover(token: string, id: string): Promise<EATakeoverResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/takeover`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EAView(token: string, id: string): Promise<EAViewResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/view`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EAyourTrustedAction(
    token: string,
    id: string,
    action: "reject" | "approve" | "reinvite",
  ): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/${action}`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EAPassword(token: string, id: string, payload: any): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/password`,
        payload,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EALockerPassword(token: string, id: string, newPass: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/emergency_access/${id}/id_password`,
        {
          new_password: newPass,
        },
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async EARemove(token: string, id: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        `/cystack_platform/pm/emergency_access/${id}`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async businessLoginMethod(): Promise<BusinessLoginMethodResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `cystack_platform/pm/users/me/login_method`,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }
  async onPremisePreLogin(preLoginPayload: OnpremisePreloginPayload): Promise<OnPremisePreLoginResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/users/onpremise/prelogin`,
        preLoginPayload,
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async onPremiseIdentifier(identifier: string): Promise<OnPremiseIdentifierResult> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/users/onpremise/identifier`,
        { identifier },
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }
}
