import { Instance, SnapshotIn, SnapshotOut, cast, types } from 'mobx-state-tree'
import { withSetPropAction } from '../helpers/withSetPropAction'
import { omit } from 'ramda'
import { toolApi } from 'app/services/api/toolApi'
import { BreanchResult } from 'app/static/types'
import { CipherView } from 'core/models/view'
/**
 * Model description here for TypeScript hints.
 */
export const ToolStoreModel = types
  .model('ToolStore')
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
    authenticatorOrder: types.optional(types.array(types.string), []),
  })
  .actions(withSetPropAction)
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

    setBreaches: (breaches: BreanchResult[]) => {
      self.breaches = cast(breaches)
    },

    setSelectedBreach: (data: BreanchResult) => {
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
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    // ----------------- API -------------------
    checkBreaches: async (email: string) => {
      const res = await toolApi.checkBreaches(self.apiToken, email)
      return res
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .postProcessSnapshot(
    omit([
      'isLoadingHealth',
      'lastHealthCheck',
      'weakPasswords',
      'reusedPasswords',
      'passwordUseMap',
      'exposedPasswordMap',
    ])
  )

export interface ToolStore extends Instance<typeof ToolStoreModel> {}
export interface ToolStoreSnapshotOut extends SnapshotOut<typeof ToolStoreModel> {}
export interface ToolStoreSnapshotIn extends SnapshotIn<typeof ToolStoreModel> {}
export const createToolStoreDefaultModel = () => types.optional(ToolStoreModel, {})
