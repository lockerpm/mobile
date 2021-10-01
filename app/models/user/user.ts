import { Instance, SnapshotOut, types, cast } from "mobx-state-tree"
import { setLang } from "../../i18n"
import { ChangePasswordData, RegisterData, SessionLoginData, LoginData } from "../../services/api"
import { UserApi } from "../../services/api/user-api"
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

    // Others data
    teams: types.maybeNull(types.array(types.frozen())),
    plan: types.maybeNull(types.frozen()),

    // User
    language: types.optional(types.string, 'en'),
    isBiometricUnlock: types.maybeNull(types.boolean),
    appTimeout: types.optional(types.number, -1),
    appTimeoutAction: types.optional(types.string, 'lock'),
  })
  .extend(withEnvironment)
  .views((self) => ({}))
  .actions((self) => ({
    // Token
    saveToken: (token: string) => {
      self.token = token
      self.isLoggedIn = true
      self.environment.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
    },
    clearToken: () => {
      self.token = ''
      self.isLoggedIn = false
      self.environment.api.apisauce.deleteHeader('Authorization')
    },

    // Info
    saveUser: (userSnapshot: UserSnapshot) => {
      self.email = userSnapshot.email
      self.username = userSnapshot.username
      self.full_name = userSnapshot.full_name
      self.avatar = userSnapshot.avatar
    },
    saveUserPw: (userSnapshot: UserSnapshot) => {
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
      self.teams = null
      self.plan = null
      self.isBiometricUnlock = false
      self.appTimeout = -1
      self.appTimeoutAction = 'lock'
    },
    setLoggedInPw: (isLoggedInPw: boolean) => {
      self.isLoggedInPw = isLoggedInPw
    },

    // Others data
    setTeams: (teams: object[]) => {
      self.teams = cast(teams)
    },
    setPlan: (plan: object) => {
      self.plan = cast(plan)
    },

    // User
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
    }
  }))
  .actions((self) => ({
    getUser: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUser()
      if (res.kind === "ok") {
        self.saveUser(res.user)
      }
      return res
    },

    sendPasswordHint: async (email: string) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sendMasterPasswordHint({ email })
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

    sessionLogin: async (payload: SessionLoginData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sessionLogin(payload)
      if (res.kind === "ok") {
        self.setLoggedInPw(true)
      }
      return res
    },

    register: async (payload: RegisterData) => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.register(payload)
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

    logout: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.logout()
      if (res.kind === "ok") {
        self.clearToken()
        self.clearUser()
      }
      return res
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
    }
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
