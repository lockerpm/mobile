import { Instance, SnapshotOut, types, cast } from "mobx-state-tree"
import { setLang } from "../../i18n"
import { ChangePasswordData, RegisterLockerData, SessionLoginData, LoginData, RegisterData } from "../../services/api"
import { UserApi } from "../../services/api/user-api"
import { saveSecure, removeSecure } from "../../utils/storage"
import { withEnvironment } from "../extensions/with-environment"


/**
 * Model description here for TypeScript hints.
 */
export const UserModel = types
  .model("User")
  .props({
    token: types.maybeNull(types.string),

    // ID
    isLoggedIn: types.maybeNull(types.boolean),
    email: types.maybeNull(types.string),
    username: types.maybeNull(types.string),
    full_name: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),

    // PM
    isLoggedInPw: types.maybeNull(types.boolean),
    pwd_user_id: types.maybeNull(types.string),
    is_pwd_manager: types.maybeNull(types.boolean),
    default_team_id: types.maybeNull(types.string),
    fingerprint: types.maybeNull(types.string),

    // Others data
    teams: types.array(types.frozen()),
    plan: types.maybeNull(types.frozen()),
    invitations: types.array(types.frozen()),
    lastSync: types.maybeNull(types.number),

    // User
    language: types.optional(types.string, 'en'),
    isBiometricUnlock: types.maybeNull(types.boolean),
    appTimeout: types.optional(types.number, 0),
    appTimeoutAction: types.optional(types.string, 'lock'),
    defaultTab: types.optional(types.string, 'homeTab')
  })
  .extend(withEnvironment)
  .views((self) => ({}))
  .actions((self) => ({
    // Token
    saveToken: (token: string) => {
      self.token = token
      self.isLoggedIn = true
      self.environment.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
      saveSecure('API_TOKEN', token)
    },
    clearToken: () => {
      self.token = ''
      self.isLoggedIn = false
      self.environment.api.apisauce.deleteHeader('Authorization')
      removeSecure('API_TOKEN')
    },

    // Info
    saveUser: (userSnapshot: UserSnapshot) => {
      self.isLoggedIn = true
      self.email = userSnapshot.email
      self.username = userSnapshot.username
      self.full_name = userSnapshot.full_name
      self.avatar = userSnapshot.avatar
    },
    saveUserPw: (userSnapshot: UserSnapshot) => {
      self.isLoggedInPw = true
      self.pwd_user_id = userSnapshot.pwd_user_id
      self.is_pwd_manager = userSnapshot.is_pwd_manager
      self.default_team_id = userSnapshot.default_team_id
    },
    clearUser: () => {
      self.isLoggedIn = false
      self.isLoggedInPw = false
      self.token = ''
      self.email = ''
      self.username = ''
      self.full_name = ''
      self.avatar = ''
      self.pwd_user_id = ''
      self.is_pwd_manager = false
      self.default_team_id = ''
      self.teams = cast([])
      self.invitations = cast([])
      self.plan = null
      self.fingerprint = ''
      self.lastSync = null
    },
    clearSettings: () => {
      self.isBiometricUnlock = false
      self.appTimeout = 0
      self.appTimeoutAction = 'lock'
      self.defaultTab = 'homeTab'
    },
    setLoggedInPw: (isLoggedInPw: boolean) => {
      self.isLoggedInPw = isLoggedInPw
    },
    setFingerprint: (fingerprint: string) => {
      self.fingerprint = fingerprint
    },

    // Others data
    setTeams: (teams: object[]) => {
      self.teams = cast(teams)
    },
    setPlan: (plan: object) => {
      self.plan = cast(plan)
    },
    setInvitations: (invitations: object[]) => {
      self.invitations = cast(invitations)
    },
    setLastSync: (lastSync: number) => {
      self.lastSync = lastSync
    },

    // User
    setDeviceID: (id: string) => {
      self.environment.api.apisauce.setHeader('device-id', id)
    },
    setLanguage: (lang: string) => {
      self.language = lang
      setLang(lang)
    },
    setBiometricUnlock: (isActive: boolean) => {
      self.isBiometricUnlock = isActive
    },
    setAppTimeout: (timeout: number) => {
      self.appTimeout = timeout
    },
    setAppTimeoutAction: (action: string) => {
      self.appTimeoutAction = action
    },
    setDefaultTab: (defaultTab: string) => {
      self.defaultTab = defaultTab
    }
  }))
  .actions((self) => ({
    // -------------------- ID ------------------------

    getUser: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUser()
      if (res.kind === "ok") {
        if (self.email && res.user.email !== self.email) {
          self.clearSettings()
        }
        self.saveUser(res.user)
      }
      return res
    },

    sendOtpEmail: async (username: string, password: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sendOtpEmail({ username, password })
      return res
    },

    recoverAccount: async (username: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.recoverAccount({ username })
      return res
    },

    resetPassword: async (username: string, method: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.resetPassword({ username, method })
      return res
    },

    resetPasswordWithCode: async (username: string, code: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.resetPasswordWithCode({ username, code })
      return res
    },

    setNewPassword: async (new_password: string, token: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.setNewPassword({ new_password, token })
      return res
    },

    login: async (payload: LoginData, isOtp?: boolean) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.login(payload, isOtp)
      if (res.kind === "ok") {
        if (res.data.token) {
          self.saveToken(res.data.token)
        }
      }
      return res
    },

    socialLogin: async (payload: { provider: string, access_token: string }) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.socialLogin(payload)
      if (res.kind === "ok") {
        if (res.data.token) {
          self.saveToken(res.data.token)
        }
      }
      return res
    },

    register: async (payload: RegisterData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.register(payload)
      return res
    },

    logout: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.logout()
      self.clearToken()
      self.clearUser()
      self.clearSettings()
      return res
    },

    deauthorizeSessions: async (hashedPassword: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.deauthorizeSessions(hashedPassword)
      return res
    },

    purgeAccount: async (hashedPassword: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.purgeAccount(hashedPassword)
      return res
    },

    deleteAccount: async (hashedPassword: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.deleteAccount(hashedPassword)
      return res
    },

    // -------------------- LOCKER ------------------------

    sendPasswordHint: async (email: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sendMasterPasswordHint({ email })
      return res
    },

    getInvitations: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getInvitations()
      return res
    },

    invitationRespond: async (id: string, status: 'accept' | 'reject') => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.invitationRespond(id, status)
      return res
    },

    getUserPw: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUserPw()
      if (res.kind === "ok") {
        self.saveUserPw(res.user)
      }
      return res
    },

    sessionLogin: async (payload: SessionLoginData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sessionLogin(payload)
      if (res.kind === "ok") {
        self.setLoggedInPw(true)
      }
      return res
    },

    registerLocker: async (payload: RegisterLockerData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.registerLocker(payload)
      return res
    },

    changeMasterPassword: async (payload: ChangePasswordData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.changeMasterPassword(payload)
      return res
    },

    lock: () => {
      self.setLoggedInPw(false)
    },

    loadTeams: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getTeams()
      if (res.kind === "ok") {
        self.setTeams(res.teams)
      }
      return res
    },

    loadPlan: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getPlan()
      if (res.kind === "ok") {
        self.setPlan(res.data)
      }
      return res
    },

    getPolicy: async (organizationId: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getPolicy(organizationId)
      return res
    },

    getLastUpdate: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getLastUpdate()
      return res
    },

    feedback: async (description: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sendFeedback({
        type: 'feedback',
        description
      })
      return res
    },
  }))

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type UserType = Instance<typeof UserModel>
export interface User extends UserType {}
type UserSnapshotType = SnapshotOut<typeof UserModel>
export interface UserSnapshot extends UserSnapshotType {}
export const createUserDefaultModel = () => types.optional(UserModel, {})
