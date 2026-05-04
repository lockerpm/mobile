import { KdfType } from "../enums/kdfType"
import { OrganizationData } from "../models/data/organizationData"
import { Organization } from "../models/domain/organization"

export abstract class UserService {
  abstract setInformation: (
    userId: string,
    email: string,
    kdf: KdfType,
    kdfVersion: number,
    kdfIterations: number,
    kdfMemory: number,
    kdfParallelism: number
  ) => Promise<void>
  abstract setEmailVerified: (emailVerified: boolean) => Promise<void>
  abstract setSecurityStamp: (stamp: string) => Promise<void>
  abstract getUserId: () => Promise<string>
  abstract getEmail: () => Promise<string>
  abstract getSecurityStamp: () => Promise<string>
  abstract getKdf: () => KdfType
  abstract getKdfVersion: () => number
  abstract getKdfIterations: () => number
  abstract getKdfMemory: () => number
  abstract getKdfParallelism: () => number
  abstract getEmailVerified: () => Promise<boolean>
  abstract clear: () => Promise<void>
  abstract isAuthenticated: () => Promise<boolean>
  abstract canAccessPremium: () => Promise<boolean>
  abstract getOrganization: (id: string) => Promise<Organization | null>
  abstract getAllOrganizations: () => Promise<Organization[]>
  abstract replaceOrganizations: (organizations: {
    [id: string]: OrganizationData
  }) => Promise<void>
  abstract clearOrganizations: (userId: string) => Promise<void>
}
