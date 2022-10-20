import { ApiResponse } from 'apisauce'
import { Logger } from '../../utils/logger'
import { Api } from './api'
import { getGeneralApiProblem } from './api-problem'
import {
  BooleanResult,
  CheckBreachResult,
  CreateRelaySubdomainResult,
  EmptyResult,
  FetchRelayListAddressesResult,
  FetchRelayListSubdomainResult,
  GenerateRelayNewAddressResult,
} from './api.types'

export class ToolApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  // Check email breaches
  async checkBreaches(token: string, email: string): Promise<CheckBreachResult> {
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
  async fetchRelayListAddresses(token: string): Promise<FetchRelayListAddressesResult> {
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

  async generateRelayNewAddress(token: string): Promise<GenerateRelayNewAddressResult> {
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

  async updateRelayAddress(token: string, id: number, address: string): Promise<EmptyResult> {
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

  async deleteRelayAddress(token: string, id: number): Promise<EmptyResult> {
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

  async useSubdomain(token: string, useSubdomain: boolean): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/relay/subdomains/use_subdomain`,
        {
          use_relay_subdomain: useSubdomain
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

  async fetchUseSubdomain(token: string): Promise<BooleanResult> {
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

  async configRelayAddress(token: string, id: number, address: string, enabled: boolean, blockSpam: boolean): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/relay/addresses/${id}`,
        {
          address,
          enabled,
          block_spam: blockSpam
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

  async createSubdomain(token: string, subdomain: string): Promise<CreateRelaySubdomainResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/relay/subdomains`,
        {
          subdomain: subdomain
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


  async editSubdomain(token: string, id: number, subdomain: string): Promise<EmptyResult> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/relay/subdomains/${id}`,
        {
          subdomain
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

  async fetchSubdomain(token: string): Promise<FetchRelayListSubdomainResult> {
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