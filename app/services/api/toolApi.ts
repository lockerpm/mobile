import { decode } from "@msgpack/msgpack"
import { ApiResponse } from "apisauce"
import { gunzipSync } from "fflate"

import {
  AppNotification,
  BreanchResult,
  RelayAddress,
  ScamLookupResult,
  ScamMyReportData,
  ScamMyReportParams,
  ScamSyncPhonesParams,
  ScamSyncPhonesResponse,
  SubdomainData,
} from "app/static/types"

import Config from "@/config"
import { Logger } from "@/utils/logger"

import { Api, api } from "./api"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"

class ToolApi {
  private api: Api = api

  async fetchInAppNoti(
    apiToken: string,
    vaultToken: string
  ): Promise<{ kind: "ok"; data: AppNotification } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/v3/notifications?scope=pwdmanager`
      )

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("fetchInAppNoti", e)
      return { kind: "bad-data" }
    }
  }

  async markReadInappNoti(
    apiToken: string,
    vaultToken: string,
    id: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      const response: ApiResponse<any> = await this.api.apisauce.put(`/v3/notifications/${id}`, {
        read: true,
      })

      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (e) {
      Logger.error("markReadInappNoti", e)
      return { kind: "bad-data" }
    }
  }

  // Check email breaches
  async checkBreaches(
    apiToken: string,
    vaultToken: string,
    email: string
  ): Promise<
    | {
        kind: "ok"
        data: BreanchResult[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/pm/tools/breach",
        { email }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("checkBreaches", e)
      return { kind: "bad-data" }
    }
  }

  // ---------------------- PRIVATE RELAY ----------------------

  async fetchRelayListAddresses(
    apiToken: string,
    vaultToken: string,
    page?: number
  ): Promise<
    | {
        kind: "ok"
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
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        "/v3/cystack_platform/relay/addresses",
        { page }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("fetchRelayListAddresses", e)
      return { kind: "bad-data" }
    }
  }

  async generateRelayNewAddress(
    apiToken: string,
    vaultToken: string
  ): Promise<{ kind: "ok"; data: RelayAddress } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/v3/cystack_platform/relay/addresses"
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("generateRelayNewAddress", e)
      return { kind: "bad-data" }
    }
  }

  async updateRelayAddress(
    apiToken: string,
    vaultToken: string,
    id: number,
    address: string
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/v3/cystack_platform/relay/addresses/${id}`,
        { address }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("updateRelayAddress", e)
      return { kind: "bad-data" }
    }
  }

  async deleteRelayAddress(
    apiToken: string,
    vaultToken: string,
    id: number
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        `/v3/cystack_platform/relay/addresses/${id}`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("deleteRelayAddress", e)
      return { kind: "bad-data" }
    }
  }

  async useSubdomain(
    apiToken: string,
    vaultToken: string,
    useSubdomain: boolean
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/v3/cystack_platform/relay/subdomains/use_subdomain`,
        {
          use_relay_subdomain: useSubdomain,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("useSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async fetchUseSubdomain(
    apiToken: string,
    vaultToken: string
  ): Promise<{ kind: "ok"; data: boolean } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/v3/cystack_platform/relay/subdomains/use_subdomain`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data.use_relay_subdomain }
    } catch (e) {
      Logger.error("fetchUseSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async configRelayAddress(
    apiToken: string,
    vaultToken: string,
    id: number,
    address: string,
    enabled: boolean,
    blockSpam: boolean
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/v3/cystack_platform/relay/addresses/${id}`,
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
      return { kind: "ok" }
    } catch (e) {
      Logger.error("configRelayAddress", e)
      return { kind: "bad-data" }
    }
  }

  async createSubdomain(
    apiToken: string,
    vaultToken: string,
    subdomain: string
  ): Promise<
    | {
        kind: "ok"
        data: SubdomainData
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/v3/cystack_platform/relay/subdomains`,
        {
          subdomain,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("createSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async editSubdomain(
    apiToken: string,
    vaultToken: string,
    id: number,
    subdomain: string
  ): Promise<
    | {
        kind: "ok"
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/v3/cystack_platform/relay/subdomains/${id}`,
        {
          subdomain,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("editSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async fetchSubdomain(
    apiToken: string,
    vaultToken: string
  ): Promise<
    | {
        kind: "ok"
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
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/v3/cystack_platform/relay/subdomains`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("fetchSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  // ---------------------- SCAM LOOKUP ----------------------
  async scamLookup(value: string): Promise<
    | {
        kind: "ok"
        data: ScamLookupResult
      }
    | GeneralApiProblem
  > {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/locker_scam_detector/v1/public/detector/checking`,
        {
          value,
        }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("editSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async scamListUsersReport(id: string): Promise<
    | {
        kind: "ok"
        data: {
          count: number
          next: null
          previous: null
          results: ScamMyReportData[]
        }
      }
    | GeneralApiProblem
  > {
    try {
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/locker_scam_detector/v1/public/detector/${id}/reports`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("editSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async scamReport(
    apiToken: string,
    vaultToken: string,
    data: ScamMyReportParams
  ): Promise<
    | {
        kind: "ok"
        data: {
          id: string
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/locker_scam_detector/v1/reports`,
        data
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("editSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async scamMyListReport(
    apiToken: string,
    vaultToken: string
  ): Promise<
    | {
        kind: "ok"
        data: {
          count: number
          next: null
          previous: null
          results: ScamMyReportData[]
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/locker_scam_detector/v1/reports`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", data: response.data }
    } catch (e) {
      Logger.error("editSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async scamDeleteMyReport(
    apiToken: string,
    vaultToken: string,
    id: string
  ): Promise<
    | {
        kind: "ok"
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.delete(
        `/locker_scam_detector/v1/reports/${id}`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("editSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async scamSyncPhones(
    apiToken: string,
    vaultToken: string,
    param: ScamSyncPhonesParams
  ): Promise<
    | {
        kind: "ok"
        data: ScamSyncPhonesResponse
      }
    | GeneralApiProblem
  > {
    try {
      const url = `${Config.BASE_URL}/locker_scam_detector/v1/detector/sync/phones?cursor=${param.cursor || "abc_0"}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Locker-Session-Token": `Bearer ${vaultToken}`,
          "Accept-Encoding": "gzip", // Yêu cầu gzip nếu có
        },
      })

      if (!response.ok) {
        return { kind: "bad-data" }
      }

      // Lấy dữ liệu dạng ArrayBuffer
      const arrayBuffer = await response.arrayBuffer()
      const compressed = new Uint8Array(arrayBuffer)

      // Kiểm tra magic number của gzip (0x1f, 0x8b)
      const isGzip = compressed[0] === 0x1f && compressed[1] === 0x8b

      let rawData: Uint8Array
      if (isGzip) {
        rawData = gunzipSync(compressed) // Giải nén
      } else {
        rawData = compressed // Không gzip
      }

      // Decode msgpack
      const decoded = decode(rawData.buffer) as ScamSyncPhonesResponse

      return { kind: "ok", data: decoded }
    } catch (e) {
      Logger.error("scamSyncPhones", e)
      return { kind: "bad-data" }
    }
  }

  async scamCheckAnonymous(
    apiToken: string,
    vaultToken: string
  ): Promise<
    | {
        kind: "ok"
        isAnonymous: boolean
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/locker_scam_detector/v1/reports/is_anonymous`
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok", isAnonymous: response.data.is_anonymous }
    } catch (e) {
      Logger.error("editSubdomain", e)
      return { kind: "bad-data" }
    }
  }

  async scamUpdateAnonymous(
    apiToken: string,
    vaultToken: string,
    isAnonymous: boolean
  ): Promise<
    | {
        kind: "ok"
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${apiToken}`)
      this.api.apisauce.setHeader("Locker-Session-Token", `${vaultToken}`)
      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/locker_scam_detector/v1/reports/is_anonymous`,
        { is_anonymous: isAnonymous }
      )
      // the typical ways to die when calling an api
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error("editSubdomain", e)
      return { kind: "bad-data" }
    }
  }
}

export const toolApi = new ToolApi()
