import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { getGeneralApiProblem } from "./api-problem"
import { CheckBreachResult } from "./api.types"

export class ToolApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  // Check email breaches
  async checkBreaches(email: string): Promise<CheckBreachResult> {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post('/cystack_platform/pm/tools/breach', { email })
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      __DEV__ && console.log(e.message)
      return { kind: "bad-data" }
    }
  }
}
