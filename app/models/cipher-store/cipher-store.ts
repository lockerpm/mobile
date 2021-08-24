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
    token: types.maybeNull(types.string),
    generatedPassword: types.maybeNull(types.string),
    selectedCipher: types.maybeNull(types.frozen())
  })
  .extend(withEnvironment)
  .views((self) => ({
    get cipherView() {
      return self.selectedCipher || new CipherView()
    }
  }))
  .actions((self) => ({
    // ----------------- TOKEN -------------------

    saveToken: (token: string) => {
      self.token = token
      self.environment.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
    },

    clearToken: () => {
      self.token = ''
      self.environment.api.apisauce.deleteHeader('Authorization')
    },

    // ----------------- CACHE -------------------

    setGeneratedPassword: (password: string) => {
      self.generatedPassword = password
    },

    setSelectedCipher: (cipher: CipherView) => {
      self.selectedCipher = cipher
    },

    // ----------------- CRUD -------------------

    syncData: async () => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.syncData()
      return res
    },

    createCipher: async (data: CipherRequest) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.postCipher(data)
      return res
    },

    moveToFolder: async (data: MoveFolderData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.moveToFolder(data)
      return res
    }
  })).postProcessSnapshot(omit(['generatedPassword', 'selectedCipher']))

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
