import { cast, Instance, SnapshotOut, types } from "mobx-state-tree"
import { omit } from "ramda"
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { CipherView } from "../../../core/models/view"
import { ImportCipherData, MoveFolderData } from "../../services/api"
import { CipherApi } from "../../services/api/cipher-api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const CipherStoreModel = types
  .model("CipherStore")
  .props({
    apiToken: types.maybeNull(types.string),

    // Status
    isSynching: types.maybeNull(types.boolean),
    isSynchingOffline: types.maybeNull(types.boolean),
    isSynchingAutofill: types.maybeNull(types.boolean),

    // Data
    notSynchedCiphers: types.array(types.string),         // Create in offline mode
    notUpdatedCiphers: types.array(types.string),         // Create in online mode but somehow not update yet
    lastSync: types.maybeNull(types.number),
    lastCacheUpdate: types.maybeNull(types.number),

    // Selector
    generatedPassword: types.maybeNull(types.string),
    selectedCipher: types.maybeNull(types.frozen()),
    selectedFolder: types.maybeNull(types.string)
  })
  .extend(withEnvironment)
  .views((self) => ({
    get cipherView() {
      return self.selectedCipher || new CipherView()
    }
  }))
  .actions((self) => ({
    setApiToken: (token: string) => {
      self.apiToken = token
    },

    // ----------------- CACHE -------------------

    setGeneratedPassword: (password: string) => {
      self.generatedPassword = password
    },

    setSelectedCipher: (cipher: CipherView) => {
      self.selectedCipher = cipher
    },

    setSelectedFolder: (folderId: string) => {
      self.selectedFolder = folderId
    },

    setIsSynching: (val: boolean) => {
      self.isSynching = val
    },

    setIsSynchingOffline: (val: boolean) => {
      self.isSynchingOffline = val
    },

    setIsSynchingAutofill: (val: boolean) => {
      self.isSynchingAutofill = val
    },

    setLastSync: () => {
      self.lastSync = Date.now()
    },

    setLastCacheUpdate: () => {
      self.lastCacheUpdate = Date.now()
    },

    addNotSync: (id: string) => {
      if (!self.notSynchedCiphers.includes(id)) {
        self.notSynchedCiphers.push(id)
      }
    },

    removeNotSync: (id: string) => {
      if (!self.notSynchedCiphers.includes(id)) {
        self.notSynchedCiphers = cast(self.notSynchedCiphers.filter(i => i !== id))
      }
    },

    clearNotSync: () => {
      self.notSynchedCiphers = cast([])
    },

    addNotUpdate: (id: string) => {
      if (!self.notUpdatedCiphers.includes(id)) {
        self.notUpdatedCiphers.push(id)
      }
    },

    removeNotUpdate: (id: string) => {
      if (self.notUpdatedCiphers.includes(id)) {
        self.notUpdatedCiphers = cast(self.notUpdatedCiphers.filter(i => i !== id))
      }
    },

    clearNotUpdate: () => {
      self.notUpdatedCiphers = cast([])
    },

    clearStore: () => {
      self.apiToken = null
      self.generatedPassword = null
      self.selectedCipher = null
      self.selectedFolder = null
      self.notSynchedCiphers = cast([])
      self.notUpdatedCiphers = cast([])
      self.isSynching = false
      self.isSynchingOffline = false
      self.isSynchingAutofill = false
      self.lastSync = null
      self.lastCacheUpdate = null
    },

    lock: () => {
      self.generatedPassword = null
      self.selectedCipher = null
      self.selectedFolder = null
    },

    // ----------------- CRUD -------------------

    syncData: async () => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.syncData(self.apiToken)
      return res
    },

    getCipher: async (id: string) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.getCipher(self.apiToken, id)
      return res
    },

    createCipher: async (data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.postCipher(self.apiToken, data, score, collectionIds)
      return res
    },

    importCipher: async (data: ImportCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.importCipher(self.apiToken, data)
      return res
    },

    offlineSyncCipher: async (data: ImportCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.offlineSyncCipher(self.apiToken, data)
      return res
    },

    updateCipher: async (id: string, data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.putCipher(self.apiToken, id, data, score, collectionIds)
      return res
    },

    shareCipher: async (id: string, data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.shareCipher(self.apiToken, id, data, score, collectionIds)
      return res
    },

    toTrashCiphers: async (ids: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.toTrashCiphers(self.apiToken, ids)
      return res
    },

    deleteCiphers: async (ids: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.deleteCiphers(self.apiToken, ids)
      return res
    },

    restoreCiphers: async (ids: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.restoresCiphers(self.apiToken, ids)
      return res
    },

    moveToFolder: async (data: MoveFolderData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.moveToFolder(self.apiToken, data)
      return res
    }
  })).postProcessSnapshot(omit([
    'generatedPassword', 
    'selectedCipher',
    'selectedFolder',
    'isSynching',
    'isSynchingOffline',
    'isSynchingAutofill'
  ]))

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type CipherStoreType = Instance<typeof CipherStoreModel>
export interface CipherStore extends CipherStoreType {}
type CipherStoreSnapshotType = SnapshotOut<typeof CipherStoreModel>
export interface CipherStoreSnapshot extends CipherStoreSnapshotType {}
export const createCipherStoreDefaultModel = () => types.optional(CipherStoreModel, {})
