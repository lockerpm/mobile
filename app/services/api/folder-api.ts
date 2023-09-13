import { ApiResponse } from "apisauce"
import { detectTempId } from "../../utils/eventBus"
import { Logger } from "../../utils/utils"
import { Api, api } from "./api"
import { GeneralApiProblem, getGeneralApiProblem } from "./api-problem"
import { FolderRequest } from "core/models/request/folderRequest"
import { CollectionActionData, EditShareCipherData, ShareFolderData } from "app/static/types"
import { CollectionRequest } from "core/models/request/collectionRequest"
import { CollectionResponse } from "core/models/response/collectionResponse"
import { CipherRequest } from "core/models/request/cipherRequest"
import { FolderResponse } from "core/models/response/folderResponse"

class FolderApi {
  private api: Api = api

  // Edit share cipher
  async editShareCipher(
    token: string,
    organizationId: string,
    groupID: string,
    payload: EditShareCipherData,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/sharing/${organizationId}/groups/${groupID}`,
        payload,
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("Edit share cipher: " + e.message)
      return { kind: "bad-data" }
    }
  }

  // Get single folder
  async getFolder(
    token: string,
    id: string,
  ): Promise<{ kind: "ok"; data: FolderResponse } | GeneralApiProblem> {
    try {
      detectTempId([id])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/sync/folders/${id}`,
      )
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
  async postFolder(
    token: string,
    data: FolderRequest,
  ): Promise<{ kind: "ok"; data: FolderResponse } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/folders",
        data,
      )
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
  async putFolder(
    token: string,
    id: string,
    data: FolderRequest,
  ): Promise<{ kind: "ok"; data: FolderResponse } | GeneralApiProblem> {
    try {
      detectTempId([id])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/folders/${id}`,
        data,
      )
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
  async deleteFolder(token: string, id: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      detectTempId([id])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        `/cystack_platform/pm/folders/${id}`,
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

  // Share Folder
  async shareFolder(
    token: string,
    payload: ShareFolderData,
  ): Promise<{ kind: "ok"; data: { id: string } } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/sharing`,
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

  // ------------------ COLLECTION API ------------------

  // Create collection
  async postCollection(
    token: string,
    teamId: string,
    data: CollectionRequest,
  ): Promise<{ kind: "ok"; data: CollectionResponse } | GeneralApiProblem> {
    try {
      detectTempId([teamId])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/sharing/${teamId}/folders`,
        data,
      )
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
  async putCollection(
    token: string,
    id: string,
    teamId: string,
    data: CollectionRequest,
  ): Promise<{ kind: "ok"; data: CollectionResponse } | GeneralApiProblem> {
    try {
      detectTempId([id, teamId])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/sharing/${teamId}/folders/${id}`,
        data,
      )
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
  async deleteCollection(
    token: string,
    id: string,
    teamId: string,
    payload: CollectionActionData,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      detectTempId([id, teamId])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/sharing/${teamId}/folders/${id}/delete`,
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

  // stopShare collection
  async stopShare(
    token: string,
    id: string,
    teamId: string,
    payload: CollectionActionData,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      detectTempId([id, teamId])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/sharing/${teamId}/folders/${id}/stop`,
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

  // remove member collection
  async removeShareMember(
    token: string,
    memberId: string,
    teamId: string,
    payload: CollectionActionData,
    isGroup?: boolean,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      detectTempId([teamId])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      let response: ApiResponse<any>

      if (!isGroup) {
        response = await this.api.apisauce.post(
          `/cystack_platform/pm/sharing/${teamId}/members/${memberId}/stop`,
          payload,
        )
      } else {
        response = await this.api.apisauce.post(
          `/cystack_platform/pm/sharing/${teamId}/groups/${memberId}/stop`,
          payload,
        )
      }

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

  async addShareMember(
    token: string,
    teamId: string,
    members: any[],
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      detectTempId([teamId])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/sharing/${teamId}/members`,
        { members },
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

  async updateShareItem(
    token: string,
    id: string,
    teamId: string,
    payload: { cipher: CipherRequest & { id: string } },
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      detectTempId([teamId])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/sharing/${teamId}/folders/${id}/items`,
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

  async removeShareItem(
    token: string,
    id: string,
    teamId: string,
    payload: { cipher: CipherRequest & { id: string } },
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      detectTempId([teamId])
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/sharing/${teamId}/folders/${id}/items`,
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
}

export const folderApi = new FolderApi()