import { ApiResponse } from "apisauce"
import { CollectionRequest } from "../../../core/models/request/collectionRequest"
import { CollectionResponse } from "../../../core/models/response/collectionResponse"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { EmptyResult, PostCollectionResult } from "./api.types"

export class CollectionApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  // Create collection
  async postCollection(teamId: string, data: CollectionRequest): Promise<PostCollectionResult> {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/teams/${teamId}/folders`, data)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const res = new CollectionResponse(response.data)
      return { kind: "ok", data: res }
    } catch (e) {
      __DEV__ && console.log(e.message)
      return { kind: "bad-data" }
    }
  }

  // Update collection
  async putCollection(id: string, teamId: string, data: CollectionRequest): Promise<PostCollectionResult> {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/teams/${teamId}/folders/${id}`, data)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const res = new CollectionResponse(response.data)
      return { kind: "ok", data: res }
    } catch (e) {
      __DEV__ && console.log(e.message)
      return { kind: "bad-data" }
    }
  }

  // Delete collection
  async deleteCollection(id: string, teamId: string): Promise<EmptyResult> {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/teams/${teamId}/folders/${id}/delete`)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      __DEV__ && console.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
