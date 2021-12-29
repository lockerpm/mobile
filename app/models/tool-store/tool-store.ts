import { cast, Instance, SnapshotOut, types } from "mobx-state-tree"
import { ToolApi } from "../../services/api/tool-api"
import { withEnvironment } from "../extensions/with-environment"
import { omit } from "ramda"

/**
 * Model description here for TypeScript hints.
 */
export const ToolStoreModel = types
  .model("ToolStore")
  .props({
    // Data breach scanner
    breachedEmail: types.maybeNull(types.string),
    breaches: types.array(types.frozen()),
    selectedBreach: types.maybeNull(types.frozen()),

    // Password health
    weakPasswords: types.array(types.frozen()),
    reusedPasswords: types.array(types.frozen()),
    exposedPasswords: types.array(types.frozen()),
    passwordStrengthMap: types.maybeNull(types.frozen()),
    passwordUseMap: types.maybeNull(types.frozen()),
    exposedPasswordMap: types.maybeNull(types.frozen()),

    // Authenticator
    authenticatorOrder: types.optional(types.array(types.string), [])
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    // ----------------- DATA -------------------

    setBreachedEmail: (email: string) => {
      self.breachedEmail = email
    },

    setBreaches: (breaches: Object[]) => {
      self.breaches = cast(breaches)
    },

    setSelectedBreach: (data: Object) => {
      self.selectedBreach = cast(data)
    },

    setWeakPasswords: (data: Object[]) => {
      self.weakPasswords = cast(data)
    },

    setReusedPasswords: (data: Object[]) => {
      self.reusedPasswords = cast(data)
    },

    setExposedPasswords: (data: Object[]) => {
      self.exposedPasswords = cast(data)
    },

    setPasswordStrengthMap: (data: Object) => {
      self.passwordStrengthMap = cast(data)
    },

    setPasswordUseMap: (data: Object) => {
      self.passwordUseMap = cast(data)
    },

    setExposedPasswordMap: (data: Object) => {
      self.exposedPasswordMap = cast(data)
    },

    setAuthenticatorOrder: (ids: string[]) => {
      self.authenticatorOrder = cast(ids)
    },

    clearStore: () => {
      self.breachedEmail = null
      self.breaches = cast([])
      self.selectedBreach = null
      self.weakPasswords = cast([])
      self.reusedPasswords = cast([])
      self.exposedPasswords = cast([])
      self.passwordStrengthMap = null
      self.passwordUseMap = null
      self.exposedPasswordMap = null
      self.authenticatorOrder = cast([])
    },

    // ----------------- API -------------------

    checkBreaches: async (email: string) => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.checkBreaches(email)
      return res
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .postProcessSnapshot(omit(['weakPasswords', 'reusedPasswords', 'passwordUseMap', 'exposedPasswordMap']))

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type ToolStoreType = Instance<typeof ToolStoreModel>
export interface ToolStore extends ToolStoreType {}
type ToolStoreSnapshotType = SnapshotOut<typeof ToolStoreModel>
export interface ToolStoreSnapshot extends ToolStoreSnapshotType {}
export const createToolStoreDefaultModel = () => types.optional(ToolStoreModel, {})
