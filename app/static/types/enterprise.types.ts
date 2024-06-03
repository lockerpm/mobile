import { AccountRoleText, EnterpriseGroupRoleText, EnterpriseInvitationStatus } from "./enum"

export type GroupData = {
  creation_date: number
  enterprise_id?: string
  id: string
  name: string
  revision_date: number
}

export type GroupMemberData = {
  avatar: string
  domain_id: string | null
  email: string
  full_name: string
  is_activated: boolean
  public_key: string
  role: EnterpriseGroupRoleText
  status: string
  username: string
}

export type EnterpriseInvitationByDomain = {
  auto_approve: boolean
  domain: string
  id: number
}

export type EnterpriseInvitation = {
  access_time: number
  domain: EnterpriseInvitationByDomain
  enterprise: {
    id: string
    name: string
  }
  id: string
  owner: string
  owner_email: string
  role: AccountRoleText
  status: EnterpriseInvitationStatus
}
