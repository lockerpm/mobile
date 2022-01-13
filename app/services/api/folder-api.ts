import { ApiResponse } from "apisauce"
import { FolderRequest } from "../../../core/models/request/folderRequest"
import { FolderResponse } from "../../../core/models/response/folderResponse"
import { Logger } from "../../utils/logger"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { EmptyResult, GetFolderResult, PostFolderResult } from "./api.types"

export class FolderApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  // Get single folder
  async getFolder(id: string): Promise<GetFolderResult> {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(`/cystack_platform/pm/folders/${id}`)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const res = new FolderResponse(response.data)

      return { kind: "ok", data: res }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Create folder
  async postFolder(data: FolderRequest): Promise<PostFolderResult> {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/cystack_platform/pm/folders', data)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const res = new FolderResponse(response.data)
      return { kind: "ok", data: res }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Update folder
  async putFolder(id: string, data: FolderRequest): Promise<PostFolderResult> {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/folders/${id}`, data)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const res = new FolderResponse(response.data)
      return { kind: "ok", data: res }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Delete folder
  async deleteFolder(id: string): Promise<EmptyResult> {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.delete(`/cystack_platform/pm/folders/${id}`)
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
