import { ApiResponse } from "apisauce";
import { Logger } from "../../utils/logger";
import { Api } from "./api";
import { getGeneralApiProblem } from "./api-problem";
import { EditShareCipherData, EmptyResult, EnterpriseGroupsMemebersResult, EnterpriseGroupsResult, EnterpriseSearchGroupResult } from "./api.types";

export class EnterpriseApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  async getListUserGroups(token: string): Promise<EnterpriseGroupsResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(`/cystack_platform/pm/enterprises/user_groups`)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      // console.log(response.data)
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async getListGroupMembers(token: string, groupId: string): Promise<EnterpriseGroupsMemebersResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(`/cystack_platform/pm/enterprises/user_groups/${groupId}/members`)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      // console.log(response.data)
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  async searchGroupOrMember(token: string, enterpriseId: string, query: string): Promise<EnterpriseSearchGroupResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/enterprises/${enterpriseId}/members_groups/search`, { query })
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      // console.log(response.data)
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Edit share cipher
  async editShareCipher(token: string, organizationId: string, groupID: string, payload: EditShareCipherData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/sharing/${organizationId}/groups/${groupID}`, payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      console.log(payload)
      return { kind: "ok" }
    } catch (e) {
      Logger.error('Edit share cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }
}