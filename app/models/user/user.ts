import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { withEnvironment } from ".."
import { SessionLoginData } from "../../services/api"
import { UserApi } from "../../services/api/user-api"
import { save, load, remove, USER_STORAGE_KEY } from "../../utils/storage"


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
    default_team_id: types.maybeNull(types.string)
  })
  .extend(withEnvironment)
  .views((self) => ({
    get info() {
      return {
        token: self.token,
        email: self.email,
        username: self.username,
        full_name: self.full_name,
        avatar: self.avatar,
        isLoggedIn: self.isLoggedIn
      }
    }
  }))
  .actions((self) => ({
    // Storage
    saveToStorage: async () => {
      await save(USER_STORAGE_KEY, self.info)
    },
    clearStorage: async () => {
      await remove(USER_STORAGE_KEY)
    },

    // Environment
    checkApiHeader: () => {
      if (self.token && !self.environment.api.apisauce.headers['Authorization']) {
        self.environment.api.apisauce.setHeader('Authorization', `Bearer ${self.token}`)
      }
    },

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
    },
    setLoggedInPw: (isLoggedInPw: boolean) => {
      self.isLoggedInPw = isLoggedInPw
    }
  }))
  .actions((self) => ({
    loadFromStorage: async () => {
      const res = await load(USER_STORAGE_KEY)
      if (res) {
        self.saveToken(res.token)
        self.saveUser(res)
        self.saveUserPw(res)
      }
    },

    getUser: async () => {
      self.checkApiHeader()
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUser()
      if (res.kind === "ok") {
        self.saveUser(res.user)
        self.saveToStorage()
      }
      return res
    },

    getUserPw: async () => {
      self.checkApiHeader()
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUserPw()
      if (res.kind === "ok") {
        self.saveUserPw(res.user)
        self.saveToStorage()
      }
      return res
    },

    sessionLogin: async (payload: SessionLoginData) => {
      self.checkApiHeader()
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.sessionLogin(payload)
      if (res.kind === "ok") {
        self.setLoggedInPw(true)
      }
      return res
    },

    lock: () => {
      self.setLoggedInPw(false)
    },

    logout: async () => {
      self.checkApiHeader()
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.logout()
      if (res.kind === "ok") {
        self.clearToken()
        self.clearUser()
        self.clearStorage()
      }
      return res
    },

    syncData: async () => {
      self.checkApiHeader()
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.syncData()
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
