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
    isSynching: types.maybeNull(types.boolean),
    notSynchedCiphers: types.array(types.string),
    lastSync: types.maybeNull(types.number),
    lastOfflineSync: types.maybeNull(types.number),
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

    setLastSync: (ts: number) => {
      self.lastSync = ts
    },

    setLastOfflineSync: (ts: number) => {
      self.lastOfflineSync = ts
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

    clearStore: () => {
      self.generatedPassword = null
      self.selectedCipher = null
      self.selectedFolder = null
      self.notSynchedCiphers = cast([])
    },

    // ----------------- CRUD -------------------

    syncData: async () => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.syncData()
      return res
    },

    createCipher: async (data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.postCipher(data, score, collectionIds)
      return res
    },

    importCipher: async (data: ImportCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.importCipher(data)
      return res
    },

    offlineSyncCipher: async (data: ImportCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.offlineSyncCipher(data)
      return res
    },

    updateCipher: async (id: string, data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.putCipher(id, data, score, collectionIds)
      return res
    },

    shareCipher: async (id: string, data: CipherRequest, score: number, collectionIds: string[], showPassword: boolean = true) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.shareCipher(id, data, score, collectionIds, showPassword)
      return res
    },

    toTrashCiphers: async (ids: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.toTrashCiphers(ids)
      return res
    },

    deleteCiphers: async (ids: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.deleteCiphers(ids)
      return res
    },

    restoreCiphers: async (ids: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.restoresCiphers(ids)
      return res
    },

    moveToFolder: async (data: MoveFolderData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.moveToFolder(data)
      return res
    }
  })).postProcessSnapshot(omit(['generatedPassword', 'selectedCipher', 'lastSync', 'lastOfflineSync']))

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
