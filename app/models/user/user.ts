import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { withEnvironment } from ".."
import { UserApi } from "../../services/api/user-api"

/**
 * Model description here for TypeScript hints.
 */
export const UserModel = types
  .model("User")
  .props({
    token: types.maybe(types.string),

    // ID
    email: types.maybe(types.string),
    username: types.maybe(types.string),
    full_name: types.maybe(types.string),
    avatar: types.maybe(types.string),

    // PM
    pwd_user_id: types.maybe(types.string),
    is_pwd_manager: types.maybe(types.string),
    default_team_id: types.maybe(types.string)
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    // Token
    saveToken: (token: string) => {
      self.token = token
      self.environment.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
    },
    clearToken: () => {
      self.token = ''
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
      self.token = ''
      self.email = ''
      self.username = ''
      self.full_name = ''
      self.avatar = ''
      self.pwd_user_id = ''
      self.is_pwd_manager = ''
      self.default_team_id = ''
    }
  }))
  .actions((self) => ({
    getUser: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUser()
      if (res.kind === "ok") {
        self.saveUser(res.user)
        return true
      } else {
        return false
      }
    },

    getUserPw: async () => {
      const userApi = new UserApi(self.environment.api)
      const res = await userApi.getUserPw()
      if (res.kind === "ok") {
        self.saveUser(res.user)
        return true
      } else {
        return false
      }
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
