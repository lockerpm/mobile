import { ApiResponse } from 'apisauce'
import { Logger } from '../../utils/utils'
import { Api, api } from './api'
import { GeneralApiProblem, getGeneralApiProblem } from './apiProblem'
import { EnterpriseInvitation, GroupData, GroupMemberData } from 'app/static/types'

class EnterpriseApi {
  private api: Api = api

  async getListUserGroups(
    token: string
  ): Promise<{ kind: 'ok'; data: GroupData[] } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/enterprises/user_groups`
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

  async getListGroupMembers(
    token: string,
    groupId: string
  ): Promise<{ kind: 'ok'; data: GroupData & { members: GroupMemberData[] } } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/enterprises/user_groups/${groupId}/members`
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

  async searchGroupOrMember(
    token: string,
    enterpriseId: string,
    query: string
  ): Promise<
    | {
        kind: 'ok'
        data: {
          groups: GroupData[]
          members: GroupMemberData[]
        }
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.post(
        `/cystack_platform/pm/enterprises/${enterpriseId}/members_groups/search`,
        { query }
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

  // Join enterprise invitations
  // Get list invitations
  async invitations(
    token: string
  ): Promise<
    | {
        kind: 'ok'
        data: EnterpriseInvitation[]
      }
    | GeneralApiProblem
  > {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.get(
        `/cystack_platform/pm/enterprises/members/invitations`
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

  async invitationsActions(
    token: string,
    id: string,
    status: 'confirmed' | 'reject'
  ): Promise<{ kind: 'ok' } | GeneralApiProblem> {
    try {
      this.api.apisauce.setHeader('Authorization', `Bearer ${token}`)

      // make the api call
      const response: ApiResponse<any> = await this.api.apisauce.put(
        `/cystack_platform/pm/enterprises/members/invitations/${id}`,
        { status }
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
}

export const enterpriseApi = new EnterpriseApi()
