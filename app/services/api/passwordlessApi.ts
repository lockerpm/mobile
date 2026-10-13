import { ApiResponse } from "apisauce"

import { CreateBackupCredentialRequest, PasswordlessCredentialResponse } from "app/static/types"

import { Logger } from "@/utils/logger"

import { Api, api } from "./api"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"

class PasswordlessApi {
  private api: Api = api

  /**
   * Public endpoint, can be called before login (used by lock screen in later phases).
   * Shared auth headers are left untouched, some calls rely on them (e.g. businessLoginMethod)
   */
  async getPasswordlessCredentials(
    email: string
  ): Promise<{ kind: "ok"; data: PasswordlessCredentialResponse } | GeneralApiProblem> {
    try {
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/pm/passwordless/credential",
        { email }
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("getPasswordlessCredentials", e)
      return { kind: "bad-data" }
    }
  }

  async createBackupCredential(
    apiToken: string,
    vaultToken: string,
    payload: CreateBackupCredentialRequest
  ): Promise<{ kind: "ok"; data: { id: string } } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/users/backup_credentials",
        payload
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("createBackupCredential", e)
      return { kind: "bad-data" }
    }
  }

  async deleteBackupCredential(
    apiToken: string,
    vaultToken: string,
    id: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        `/v3/cystack_platform/pm/users/backup_credentials/${id}`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("deleteBackupCredential", e)
      return { kind: "bad-data" }
    }
  }

  async deletePrimaryPasswordlessCredential(
    apiToken: string,
    vaultToken: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        "/v3/cystack_platform/pm/passwordless/credential"
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("deletePrimaryPasswordlessCredential", e)
      return { kind: "bad-data" }
    }
  }
}

export const passwordlessApi = new PasswordlessApi()
