import { ApiResponse } from "apisauce"
import { 
  ConfirmShareCipherData, EditShareCipherData, EmptyResult, GetCipherResult, 
  GetLastUpdateResult, GetMySharesResult, GetOrganizationResult, GetProfileResult, 
  GetShareInvitationsResult, GetSharingPublicKeyData, GetSharingPublicKeyResult, 
  ImportCipherData, 
  ImportCipherWithFolderData, ImportFolderData, ImportFolderResult, MoveFolderData, PostCipherResult, 
  ShareCipherData, ShareCipherResult, ShareInvitationResponseData, ShareMultipleCiphersData, 
  StopShareCipherData, SyncResult 
} from "./api.types"
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { Logger } from "../../utils/logger"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { detectTempId } from "../../utils/event-bus/helpers"

export class CipherApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  // Sync
  async syncData(token: string, page?: number, size?: number): Promise<SyncResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get('/cystack_platform/pm/sync', {
        paging: page ? 1 : 0,
        page,
        size
      })
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error('Sync data: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Get single cipher
  async getCipher(token: string, id: string): Promise<GetCipherResult> {
    try {
      detectTempId([id])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(`/cystack_platform/pm/sync/ciphers/${id}`)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error('Get cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Create cipher
  async postCipher(token: string, data: CipherRequest, score: number, collectionIds: string[]): Promise<PostCipherResult> {
    try {
      detectTempId(collectionIds)
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      console.log(data)
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
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error('Post cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Import ciphers + folders + relationships
  async importCipherWithFolder(token: string, data: ImportCipherWithFolderData): Promise<EmptyResult> {
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
      Logger.error('Import cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Import folders
  async importFolders(token: string, data: ImportFolderData): Promise<ImportFolderResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/cystack_platform/pm/import/folders', data)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error('Import cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Import ciphers
  async importCiphers(token: string, data: ImportCipherData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/cystack_platform/pm/import/ciphers', data)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error('Import cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Offline sync cipher
  async offlineSyncCipher(token: string, data: ImportCipherWithFolderData): Promise<EmptyResult> {
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
      Logger.error('Offline sync cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Update cipher
  async putCipher(token: string, id: string, data: CipherRequest, score: number, collectionIds: string[]): Promise<EmptyResult> {
    try {
      detectTempId([id, ...collectionIds])
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
      Logger.error('Put cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Share cipher to team
  async shareCipherToTeam(token: string, id: string, data: CipherRequest, score: number, collectionIds: string[]): Promise<EmptyResult> {
    try {
      detectTempId([id, ...collectionIds])
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
      Logger.error('Share cipher to team: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Permanent delete ciphers
  async deleteCiphers(token: string, ids: string[]): Promise<EmptyResult> {
    try {
      detectTempId(ids)
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
      Logger.error('Delete ciphers: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Move to trash ciphers
  async toTrashCiphers(token: string, ids: string[]): Promise<EmptyResult> {
    try {
      detectTempId(ids)
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
      Logger.error('To trash ciphers: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Restore ciphers
  async restoresCiphers(token: string, ids: string[]): Promise<EmptyResult> {
    try {
      detectTempId(ids)
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
      Logger.error('Restore cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Move to folder
  async moveToFolder(token: string, data: MoveFolderData): Promise<EmptyResult> {
    try {
      detectTempId([data.folderId, ...data.ids])
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
      Logger.error('Move to folder: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Get last update time
  async getLastUpdate(token: string): Promise<GetLastUpdateResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(`/cystack_platform/pm/users/me/revision_date`)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data
      return { kind: "ok", data }
    } catch (e) {
      Logger.error('Get last update: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Get sharing public key
  async getSharingPublicKey(token: string, payload: GetSharingPublicKeyData): Promise<GetSharingPublicKeyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/public_key`, payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error('Get sharing public key: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  

  // Share cipher
  async shareCipher(token: string, payload: ShareCipherData): Promise<ShareCipherResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/sharing`, payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error('Share cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Share multiple ciphers
  async shareMultipleCiphers(token: string, payload: ShareMultipleCiphersData): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/sharing/multiple`, payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error('Share multiple ciphers: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Stop share cipher
  async stopShareCipher(token: string, organizationId: string, memberId: string, payload: StopShareCipherData): Promise<EmptyResult> {
    try {
      detectTempId([organizationId, memberId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/${organizationId}/members/${memberId}/stop`, payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error('Stop share cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Edit share cipher
  async editShareCipher(token: string, organizationId: string, memberId: string, payload: EditShareCipherData): Promise<EmptyResult> {
    try {
      detectTempId([organizationId, memberId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/sharing/${organizationId}/members/${memberId}`, payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error('Edit share cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Confirm share cipher
  async confirmShareCipher(token: string, organizationId: string, memberId: string, payload: ConfirmShareCipherData): Promise<EmptyResult> {
    try {
      detectTempId([organizationId, memberId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/${organizationId}/members/${memberId}`, payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error('Confirm share cipher: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Get sharing invitations
  async getSharingInvitations(token: string): Promise<GetShareInvitationsResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(`/cystack_platform/pm/sharing/invitations`)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error('Get sharing invitation:' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Get my shares
  async getMyShares(token: string): Promise<GetMySharesResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(`/cystack_platform/pm/sharing/my_share`)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error('Get my shares: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Leave share
  async leaveShare(token: string, organizationId: string): Promise<EmptyResult> {
    try {
      detectTempId([organizationId])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(`/cystack_platform/pm/sharing/${organizationId}/leave`, {})
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error('Leave share: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Respond to share invitation
  async respondShareInvitation(token: string, id: string, payload: ShareInvitationResponseData): Promise<EmptyResult> {
    try {
      detectTempId([id])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(`/cystack_platform/pm/sharing/invitations/${id}`, payload)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error('Respond share invitation: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Get profile
  async getPMProfile(token: string): Promise<GetProfileResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get('/cystack_platform/pm/sync/profile')
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data

      return { kind: "ok", data }
    } catch (e) {
      Logger.error('Get PM profile: ' + e.message)
      return { kind: "bad-data" }
    }
  }

  // Get single organization
  async getOrganization(token: string, id: string): Promise<GetOrganizationResult> {
    try {
      detectTempId([id])
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(`/cystack_platform/pm/sync/organizations/${id}`)
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error('Get org: ' + e.message)
      return { kind: "bad-data" }
    }
  }
}
