import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { omit } from "ramda"
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { CipherView } from "../../../core/models/view"
import { MoveFolderData } from "../../services/api"
import { CipherApi } from "../../services/api/cipher-api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const CipherStoreModel = types
  .model("CipherStore")
  .props({
    lastSync: types.maybeNull(types.number),
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

    setLastSync: (ts: number) => {
      self.lastSync = ts
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

    updateCipher: async (id: string, data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.putCipher(id, data, score, collectionIds)
      return res
    },

    shareCipher: async (id: string, data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.shareCipher(id, data, score, collectionIds)
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
  })).postProcessSnapshot(omit(['generatedPassword', 'selectedCipher', 'lastSync']))

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
