import { ApiResponse } from "apisauce"
import { EmptyResult } from "."
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"

export class CipherApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
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
