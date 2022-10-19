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
    apiToken: types.maybeNull(types.string),

    // Data breach scanner
    breachedEmail: types.maybeNull(types.string),
    breaches: types.array(types.frozen()),
    selectedBreach: types.maybeNull(types.frozen()),

    // Password health
    isDataLoading: types.maybeNull(types.boolean), // is data synchronizing or decrypting
    isLoadingHealth: types.maybeNull(types.boolean),
    lastHealthCheck: types.maybeNull(types.number),
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
    setApiToken: (token: string) => {
      self.apiToken = token
    },

    // ----------------- DATA -------------------

    // BREACH

    setBreachedEmail: (email: string) => {
      self.breachedEmail = email
    },

    setBreaches: (breaches: Object[]) => {
      self.breaches = cast(breaches)
    },

    setSelectedBreach: (data: Object) => {
      self.selectedBreach = cast(data)
    },

    // HEALTH

    setLoadingHealth: (val: boolean) => {
      self.isLoadingHealth = val
    },

    setDataLoading: (val: boolean) => {
      self.isDataLoading = val
    },

    setLastHealthCheck: (val?: number) => {
      self.lastHealthCheck = val === undefined ? Date.now() : val
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

    // AUTHENTICATOR

    setAuthenticatorOrder: (ids: string[]) => {
      self.authenticatorOrder = cast(ids)
    },

    // OTHER

    clearStore: (dataOnly?: boolean) => {
      if (!dataOnly) {
        self.apiToken = null
      }

      self.breachedEmail = null
      self.breaches = cast([])
      self.selectedBreach = null

      self.isLoadingHealth = false
      self.lastHealthCheck = null
      self.weakPasswords = cast([])
      self.reusedPasswords = cast([])
      self.exposedPasswords = cast([])
      self.passwordStrengthMap = null
      self.passwordUseMap = null
      self.exposedPasswordMap = null

      self.authenticatorOrder = cast([])
    },

    lock: () => {
      self.breachedEmail = null
      self.breaches = cast([])
      self.selectedBreach = null

      self.isLoadingHealth = false
      self.lastHealthCheck = null
      self.weakPasswords = cast([])
      self.reusedPasswords = cast([])
      self.exposedPasswords = cast([])
      self.passwordStrengthMap = null
      self.passwordUseMap = null
      self.exposedPasswordMap = null
    },

    // ----------------- API -------------------

    // PRIVATE RELAY 
    fetchRelayListAddresses: async () => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.fetchRelayListAddresses(self.apiToken)
      return res
    },

    generateRelayNewAddress: async () => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.generateRelayNewAddress(self.apiToken)
      return res
    },

    updateRelayAddress: async (addressId: number, address: string) => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.updateRelayAddress(self.apiToken, addressId, address)
      return res
    },

    deleteRelayAddress: async (addressId: number) => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.deleteRelayAddress(self.apiToken, addressId)
      return res
    },

    configRelayAddress: async (id: number, address: string, enabled: boolean, blockSpam: boolean) => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.configRelayAddress(self.apiToken, id, address, enabled, blockSpam)
      return res
    },

    fetchSubdomain: async () => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.fetchSubdomain(self.apiToken)
      return res
    },

    createSubdomain: async (subdomain: string) => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.createSubdomain(self.apiToken, subdomain)
      return res
    },

    editSubdomain: async (id: number,  subdomain: string) => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.editSubdomain(self.apiToken,id, subdomain)
      return res
    },

    useSubdomain: async (useSubdomain: boolean) => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.useSubdomain(self.apiToken, useSubdomain)
      return res
    },

    fetchUseSubdomain: async () => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.fetchUseSubdomain(self.apiToken)
      return res
    },

    checkBreaches: async (email: string) => {
      const toolApi = new ToolApi(self.environment.api)
      const res = await toolApi.checkBreaches(self.apiToken, email)
      return res
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .postProcessSnapshot(omit([
    'isLoadingHealth',
    'lastHealthCheck',
    'weakPasswords',
    'reusedPasswords',
    'passwordUseMap',
    'exposedPasswordMap'
  ]))

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type ToolStoreType = Instance<typeof ToolStoreModel>
export interface ToolStore extends ToolStoreType { }
type ToolStoreSnapshotType = SnapshotOut<typeof ToolStoreModel>
export interface ToolStoreSnapshot extends ToolStoreSnapshotType { }
export const createToolStoreDefaultModel = () => types.optional(ToolStoreModel, {})
