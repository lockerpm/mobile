import { StorageService } from "../abstractions/storage.service"
import { TokenService } from "../abstractions/token.service"
import { UserService as UserServiceAbstraction } from "../abstractions/user.service"
import { KdfType } from "../enums/kdfType"
import { OrganizationData } from "../models/data/organizationData"
import { Organization } from "../models/domain/organization"

const Keys = {
  userId: "userId",
  userEmail: "userEmail",
  stamp: "securityStamp",
  kdf: "kdf",
  kdfVersion: "kdfVersion",
  kdfIterations: "kdfIterations",
  kdfMemory: "kdfMemory",
  kdfParallelism: "kdfParallelism",
  organizationsPrefix: "organizations_",
  emailVerified: "emailVerified",
}

export class UserService implements UserServiceAbstraction {
  private userId: string | null = null
  private email: string | null = null
  private stamp: string | null = null
  private kdf: KdfType | null = null
  private kdfVersion: number | null = null
  private kdfIterations: number | null = null
  private kdfMemory: number | null = null
  private kdfParallelism: number | null = null
  private emailVerified: boolean | null = null

  constructor(
    private tokenService: TokenService,
    private storageService: StorageService
  ) {}

  async setInformation(
    userId: string,
    email: string,
    kdf: KdfType,
    kdfVersion: number,
    kdfIterations: number,
    kdfMemory: number,
    kdfParallelism: number
  ): Promise<void> {
    this.email = email
    this.userId = userId
    this.kdf = kdf
    this.kdfVersion = kdfVersion
    this.kdfIterations = kdfIterations
    this.kdfMemory = kdfMemory
    this.kdfParallelism = kdfParallelism

    await Promise.all([
      this.storageService.save(Keys.userEmail, email),
      this.storageService.save(Keys.userId, userId),
      this.storageService.save(Keys.kdf, kdf),
      this.storageService.save(Keys.kdfVersion, kdfVersion),
      this.storageService.save(Keys.kdfIterations, kdfIterations),
      this.storageService.save(Keys.kdfMemory, kdfMemory),
      this.storageService.save(Keys.kdfParallelism, kdfParallelism),
    ])
  }

  setSecurityStamp(stamp: string): Promise<void> {
    this.stamp = stamp
    return this.storageService.save(Keys.stamp, stamp)
  }

  setEmailVerified(emailVerified: boolean) {
    this.emailVerified = emailVerified
    return this.storageService.save(Keys.emailVerified, emailVerified)
  }

  async getUserId(): Promise<string> {
    if (this.userId == null) {
      this.userId = await this.storageService.get<string>(Keys.userId)
    }
    return this.userId
  }

  async getEmail(): Promise<string> {
    if (this.email == null) {
      this.email = await this.storageService.get<string>(Keys.userEmail)
    }
    return this.email
  }

  async getSecurityStamp(): Promise<string> {
    if (this.stamp == null) {
      this.stamp = await this.storageService.get<string>(Keys.stamp)
    }
    return this.stamp
  }

  getKdf(): KdfType {
    if (this.kdf == null) {
      this.kdf = this.storageService.get<KdfType>(Keys.kdf)
    }
    return this.kdf
  }

  getKdfVersion(): number {
    if (this.kdfVersion == null) {
      this.kdfVersion = this.storageService.get<number>(Keys.kdfVersion)
    }
    return this.kdfVersion
  }

  getKdfIterations(): number {
    if (this.kdfIterations == null) {
      this.kdfIterations = this.storageService.get<number>(Keys.kdfIterations)
    }
    return this.kdfIterations
  }

  getKdfMemory(): number {
    if (this.kdfMemory == null) {
      this.kdfMemory = this.storageService.get<number>(Keys.kdfMemory)
    }
    return this.kdfMemory
  }

  getKdfParallelism(): number {
    if (this.kdfParallelism == null) {
      this.kdfParallelism = this.storageService.get<number>(Keys.kdfParallelism)
    }
    return this.kdfParallelism
  }

  async getEmailVerified(): Promise<boolean> {
    if (this.emailVerified == null) {
      this.emailVerified = await this.storageService.get<boolean>(Keys.emailVerified)
    }
    return this.emailVerified
  }

  async clear(): Promise<void> {
    const userId = await this.getUserId()

    await Promise.all([
      this.storageService.remove(Keys.userId),
      this.storageService.remove(Keys.userEmail),
      this.storageService.remove(Keys.stamp),
      this.storageService.remove(Keys.kdf),
      this.storageService.remove(Keys.kdfVersion),
      this.storageService.remove(Keys.kdfIterations),
      this.storageService.remove(Keys.kdfMemory),
      this.storageService.remove(Keys.kdfParallelism),
      this.clearOrganizations(userId),
    ])

    this.userId = this.email = this.stamp = null
    this.kdf = null
    this.kdfVersion = null
    this.kdfIterations = null
    this.kdfMemory = null
    this.kdfParallelism = null
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.tokenService.getToken()
    if (token == null) {
      return false
    }

    const userId = await this.getUserId()
    return userId != null
  }

  async canAccessPremium(): Promise<boolean> {
    const authed = await this.isAuthenticated()
    if (!authed) {
      return false
    }

    const tokenPremium = this.tokenService.getPremium()
    if (tokenPremium) {
      return true
    }

    const orgs = await this.getAllOrganizations()
    for (let i = 0; i < orgs.length; i++) {
      if (orgs[i].usersGetPremium && orgs[i].enabled) {
        return true
      }
    }
    return false
  }

  async getOrganization(id: string): Promise<Organization | null> {
    const userId = await this.getUserId()
    const organizations = await this.storageService.get<{
      [id: string]: OrganizationData
    }>(Keys.organizationsPrefix + userId)
    // eslint-disable-next-line no-prototype-builtins
    if (organizations == null || !organizations.hasOwnProperty(id)) {
      return null
    }

    return new Organization(organizations[id])
  }

  async getAllOrganizations(): Promise<Organization[]> {
    const userId = await this.getUserId()
    const organizations = await this.storageService.get<{
      [id: string]: OrganizationData
    }>(Keys.organizationsPrefix + userId)
    const response: Organization[] = []
    for (const id in organizations) {
      // eslint-disable-next-line no-prototype-builtins
      if (organizations.hasOwnProperty(id)) {
        response.push(new Organization(organizations[id]))
      }
    }
    return response
  }

  async replaceOrganizations(organizations: { [id: string]: OrganizationData }): Promise<void> {
    const userId = await this.getUserId()
    await this.storageService.save(Keys.organizationsPrefix + userId, organizations)
  }

  async clearOrganizations(userId: string): Promise<void> {
    await this.storageService.remove(Keys.organizationsPrefix + userId)
  }
}
