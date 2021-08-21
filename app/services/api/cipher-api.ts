import { ApiResponse } from "apisauce"
import { EmptyResult, SyncResult } from "."
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { SyncResponse } from "../../../core/models/response/syncResponse"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"

export class CipherApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  // Sync
  async syncData(): Promise<SyncResult> {
    try {
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
      __DEV__ && console.log(e.message)
      return { kind: "bad-data" }
    }
  }

  // Create cipher
  async postCipher(data: CipherRequest): Promise<EmptyResult> {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/cystack_platform/pm/ciphers/vaults', data)
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
