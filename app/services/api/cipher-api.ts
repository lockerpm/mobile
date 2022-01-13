import { ApiResponse } from "apisauce"
import { EmptyResult, GetCipherResult, ImportCipherData, MoveFolderData, SyncResult } from "."
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { SyncResponse } from "../../../core/models/response/syncResponse"
import { Logger } from "../../utils/logger"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"

export class CipherApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  // Sync
  async syncData(token: string): Promise<SyncResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get('/cystack_platform/pm/sync')
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const res = new SyncResponse(response.data)

      return { kind: "ok", data: res }
    } catch (e) {
      Logger.error(e.message)
      return { kind: "bad-data" }
    }
  }

  // Get single cipher
  async getCipher(token: string, id: string): Promise<GetCipherResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(`/cystack_platform/pm/ciphers/${id}`)
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

  // Create cipher
  async postCipher(token: string, data: CipherRequest, score: number, collectionIds: string[]): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/cystack_platform/pm/ciphers/vaults', {
        ...data,
        score,
        collectionIds
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

  // Import cipher
  async importCipher(token: string, data: ImportCipherData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/cystack_platform/pm/ciphers/import', data)
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

  // Offline sync cipher
  async offlineSyncCipher(token: string, data: ImportCipherData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/cystack_platform/pm/ciphers/sync/offline', data)
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

  // Update cipher
  async putCipher(token: string, id: string, data: CipherRequest, score: number, collectionIds: string[]): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/ciphers/${id}`, {
        ...data,
        score,
        collectionIds
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

  // Share cipher
  async shareCipher(token: string, id: string, data: CipherRequest, score: number, collectionIds: string[]): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/ciphers/${id}/share`, {
        ...data,
        score,
        collectionIds
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

  // Permanent delete ciphers
  async deleteCiphers(token: string, ids: string[]): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/ciphers/permanent_delete`, { ids })
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

  // Move to trash ciphers
  async toTrashCiphers(token: string, ids: string[]): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/ciphers/delete`, { ids })
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

  // Restore ciphers
  async restoresCiphers(token: string, ids: string[]): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/ciphers/restore`, { ids })
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

  // Move to folder
  async moveToFolder(token: string, data: MoveFolderData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put('/cystack_platform/pm/ciphers/move', data)
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
