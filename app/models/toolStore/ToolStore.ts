import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { toolApi } from "app/services/api/toolApi"
import { CipherView } from "core/models/view"
/**
 * Model description here for TypeScript hints.
 */
export const ToolStoreModel = types
  .model("ToolStore")
  .props({
    apiToken: types.string,

    // Password health
    isDataLoading: types.boolean, // is data synchronizing or decrypting
    isLoadingHealth: types.boolean,
    lastHealthCheck: types.number,
    weakPasswords: types.array(types.frozen()),
    reusedPasswords: types.array(types.frozen()),
    exposedPasswords: types.array(types.frozen()),
    passwordStrengthMap: types.maybeNull(types.frozen()),
    passwordUseMap: types.maybeNull(types.frozen()),
    exposedPasswordMap: types.maybeNull(types.frozen()),

    // scam
    lastSyncCursor: types.maybeNull(types.string), // last sync cursor for scam phone numbers
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setApiToken: (token: string) => {
      self.apiToken = token
    },

    // ----------------- DATA -------------------
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

    setWeakPasswords: (data: CipherView[]) => {
      self.weakPasswords = cast(data)
    },

    setReusedPasswords: (data: CipherView[]) => {
      self.reusedPasswords = cast(data)
    },

    setExposedPasswords: (data: CipherView[]) => {
      self.exposedPasswords = cast(data)
    },

    setPasswordStrengthMap: (data: Map<any, any>) => {
      self.passwordStrengthMap = cast(data)
    },

    setPasswordUseMap: (data: Map<any, any>) => {
      self.passwordUseMap = cast(data)
    },

    setExposedPasswordMap: (data: Map<any, any>) => {
      self.exposedPasswordMap = cast(data)
    },

    // OTHER

    clearStore: (dataOnly?: boolean) => {
      if (!dataOnly) {
        self.apiToken = ""
      }
      self.isLoadingHealth = false
      self.lastHealthCheck = 0
      self.weakPasswords = cast([])
      self.reusedPasswords = cast([])
      self.exposedPasswords = cast([])
      self.passwordStrengthMap = null
      self.passwordUseMap = null
      self.exposedPasswordMap = null
    },

    lock: () => {
      self.isLoadingHealth = false
      self.lastHealthCheck = 0
      self.weakPasswords = cast([])
      self.reusedPasswords = cast([])
      self.exposedPasswords = cast([])
      self.passwordStrengthMap = null
      self.passwordUseMap = null
      self.exposedPasswordMap = null
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    // ----------------- API -------------------

    // PRIVATE RELAY
    fetchRelayListAddresses: async (page?: number) => {
      const res = await toolApi.fetchRelayListAddresses(self.apiToken, page)
      return res
    },

    generateRelayNewAddress: async () => {
      const res = await toolApi.generateRelayNewAddress(self.apiToken)
      return res
    },

    updateRelayAddress: async (addressId: number, address: string) => {
      const res = await toolApi.updateRelayAddress(self.apiToken, addressId, address)
      return res
    },

    deleteRelayAddress: async (addressId: number) => {
      const res = await toolApi.deleteRelayAddress(self.apiToken, addressId)
      return res
    },

    configRelayAddress: async (
      id: number,
      address: string,
      enabled: boolean,
      blockSpam: boolean
    ) => {
      const res = await toolApi.configRelayAddress(self.apiToken, id, address, enabled, blockSpam)
      return res
    },

    fetchSubdomain: async () => {
      const res = await toolApi.fetchSubdomain(self.apiToken)
      return res
    },

    createSubdomain: async (subdomain: string) => {
      const res = await toolApi.createSubdomain(self.apiToken, subdomain)
      return res
    },

    editSubdomain: async (id: number, subdomain: string) => {
      const res = await toolApi.editSubdomain(self.apiToken, id, subdomain)
      return res
    },

    useSubdomain: async (useSubdomain: boolean) => {
      const res = await toolApi.useSubdomain(self.apiToken, useSubdomain)
      return res
    },

    fetchUseSubdomain: async () => {
      const res = await toolApi.fetchUseSubdomain(self.apiToken)
      return res
    },

    checkBreaches: async (email: string) => {
      const res = await toolApi.checkBreaches(self.apiToken, email)
      return res
    },

    updateSyncScamPhones: async (cursor: string) => {
      self.lastSyncCursor = cursor
    },
  }))
  .postProcessSnapshot((snapShot) => {
    return {
      ...snapShot,
      isLoadingHealth: false,
      lastHealthCheck: 0,
      weakPasswords: [],
      reusedPasswords: [],
      passwordUseMap: null,
      exposedPasswordMap: null,
    }
  })

export interface ToolStore extends Instance<typeof ToolStoreModel> {}
export interface ToolStoreSnapshotOut extends SnapshotOut<typeof ToolStoreModel> {}
export interface ToolStoreSnapshotIn extends SnapshotIn<typeof ToolStoreModel> {}
export const createToolStoreDefaultModel = () =>
  types.optional(ToolStoreModel, {
    apiToken: "",

    // Password health
    isDataLoading: false, // is data synchronizing or decrypting
    isLoadingHealth: false,
    lastHealthCheck: 0,
    weakPasswords: [],
    reusedPasswords: [],
    exposedPasswords: [],
    passwordStrengthMap: null,
    passwordUseMap: null,
    exposedPasswordMap: null,
  })
