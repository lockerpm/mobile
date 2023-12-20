import { ApiResponse } from 'apisauce'
import { Logger } from '../../utils/utils'
import { Api, api } from './api'
import { GeneralApiProblem, getGeneralApiProblem } from './apiProblem'
import { AppNotification, BreanchResult, RelayAddress, SubdomainData } from 'app/static/types'

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

  // ---------------------- PRIVATE RELAY ----------------------

  async fetchRelayListAddresses(token: string): Promise<
    | {
        kind: 'ok'
        data: {
          count: number
          next: string | null
          previous: string | null
          results: RelayAddress[]
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        '/cystack_platform/relay/addresses'
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

  async generateRelayNewAddress(
    token: string
  ): Promise<{ kind: 'ok'; data: RelayAddress } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        '/cystack_platform/relay/addresses'
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

  async updateRelayAddress(
    token: string,
    id: number,
    address: string
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/relay/addresses/${id}`,
        { address }
      )
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

  async deleteRelayAddress(token: string, id: number): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        `/cystack_platform/relay/addresses/${id}`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok' }
    } catch (e) {
      return { kind: 'bad-data' }
    }
  }

  async useSubdomain(
    token: string,
    useSubdomain: boolean
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/relay/subdomains/use_subdomain`,
        {
          use_relay_subdomain: useSubdomain,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok' }
    } catch (e) {
      return { kind: 'bad-data' }
    }
  }

  async fetchUseSubdomain(
    token: string
  ): Promise<{ kind: 'ok'; data: boolean } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/relay/subdomains/use_subdomain`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', data: response.data.use_relay_subdomain }
    } catch (e) {
      return { kind: 'bad-data' }
    }
  }

  async configRelayAddress(
    token: string,
    id: number,
    address: string,
    enabled: boolean,
    blockSpam: boolean
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/relay/addresses/${id}`,
        {
          address,
          enabled,
          block_spam: blockSpam,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok' }
    } catch (e) {
      return { kind: 'bad-data' }
    }
  }

  async createSubdomain(
    token: string,
    subdomain: string
  ): Promise<
    | {
        kind: 'ok'
        data: SubdomainData
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/relay/subdomains`,
        {
          subdomain,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', data: response.data }
    } catch (e) {
      return { kind: 'bad-data' }
    }
  }

  async editSubdomain(
    token: string,
    id: number,
    subdomain: string
  ): Promise<
    | {
        kind: 'ok'
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/relay/subdomains/${id}`,
        {
          subdomain,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok' }
    } catch (e) {
      return { kind: 'bad-data' }
    }
  }

  async fetchSubdomain(token: string): Promise<
    | {
        kind: 'ok'
        data: {
          count: number
          next: null
          previous: null
          results: SubdomainData[]
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/relay/subdomains`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: 'ok', data: response.data }
    } catch (e) {
      return { kind: 'bad-data' }
    }
  }
}

export const toolApi = new ToolApi()
