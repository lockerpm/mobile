import { ApiResponse } from 'apisauce'
import { Logger } from '../../utils/utils'
import { Api, api } from './api'
import { GeneralApiProblem, getGeneralApiProblem } from './apiProblem'
import { AppNotification, BreanchResult } from 'app/static/types'

class ToolApi {
  private api: Api = api

  async fetchInAppNoti(
    token: string
  ): Promise<{ kind: 'ok'; data: AppNotification } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/notifications?scope=pwdmanager`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  async markReadInappNoti(token: string, id: string): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      const response: ApiResponse<any> = await this.api.apisauce.put(`/notifications/${id}`, {
        read: true,
      })

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: 'ok' }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }

  // Check email breaches
  async checkBreaches(
    token: string,
    email: string
  ): Promise<
    | {
        kind: 'ok'
        data: BreanchResult[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/pm/tools/breach',
        { email }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', data: response.data }
    } catch (e) {
      Logger.error(e.message)
      return { kind: 'bad-data' }
    }
  }
}

export const toolApi = new ToolApi()
