import { ApiResponse } from "apisauce"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import { api, Api } from "./api"
import { GetAttachmentUrlResult, GetUploadFormData, GetUploadFormResult } from "app/static/types"
import { Logger } from "app/utils/utils"

class AttachmentApi {
  private api: Api = api

  public async getAttachmentUrl(
    token: string,
    path: string,
  ): Promise<{ kind: "ok"; data: GetAttachmentUrlResult } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/attachments/url`,
        {
          path,
        },
      )
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data
      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e)
      return { kind: "bad-data" }
    }
  }

  public async getUploadForm(
    token: string,
    payload: GetUploadFormData,
  ): Promise<{ kind: "ok"; data: GetUploadFormResult } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/attachments",
        payload,
      )
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      const data = response.data
      return { kind: "ok", data }
    } catch (e) {
      Logger.error(e)
      return { kind: "bad-data" }
    }
  }

  public async deleteAttachment(
    token: string,
    paths: string[],
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader("Authorization", `Bearer ${token}`)

      const response: ApiResponse<any> = await this.api.apisauce.post(
        "/cystack_platform/pm/attachments/multiple_delete",
        {
          paths,
        },
      )
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }
      return { kind: "ok" }
    } catch (e) {
      Logger.error(e)
      return { kind: "bad-data" }
    }
  }
}

export const attachmentApi = new AttachmentApi()
