import { ApiResponse } from "apisauce"
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { CollectionRequest } from "../../../core/models/request/collectionRequest"
import { CollectionResponse } from "../../../core/models/response/collectionResponse"
import { detectTempId } from "../../utils/event-bus/helpers"
import { Logger } from "../../utils/logger"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { CollectionActionData, EmptyResult, PostCollectionResult } from "./api.types"

export class CollectionApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  // Create collection
  async postCollection(token: string, teamId: string, data: CollectionRequest): Promise<PostCollectionResult> {
    try {
      detectTempId([teamId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/${teamId}/folders`, data)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const res = new CollectionResponse(response.data)
      return { kind: "ok", data: res }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Update collection
  async putCollection(token: string, id: string, teamId: string, data: CollectionRequest): Promise<PostCollectionResult> {
    try {
      detectTempId([id, teamId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/sharing/${teamId}/folders/${id}`, data)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const res = new CollectionResponse(response.data)
      return { kind: "ok", data: res }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Delete collection
  async deleteCollection(token: string, id: string, teamId: string, payload: CollectionActionData): Promise<EmptyResult> {
    try {
      detectTempId([id, teamId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/${teamId}/folders/${id}/delete`, payload)
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

  // stopShare collection
  async stopShare(token: string, id: string, teamId: string, payload: CollectionActionData): Promise<EmptyResult> {
    try {
      detectTempId([id, teamId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/${teamId}/folders/${id}/stop`, payload)
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
  // remove member collection
  async removeShareMember(token: string, memberId: string, teamId: string, payload: CollectionActionData): Promise<EmptyResult> {
    try {
      detectTempId([teamId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/${teamId}/members/${memberId}/stop`, payload)
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


  async addShareMember(token: string, teamId: string, members: any[]): Promise<EmptyResult> {
    try {
      detectTempId([teamId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/${teamId}/members`, {members})
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

  async updateShareItem(token: string, id: string, teamId: string, payload: {cipher: CipherRequest & { id: string }}): Promise<EmptyResult> {
    try {
      detectTempId([teamId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/${teamId}/folders/${id}/items`, payload)
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

}
