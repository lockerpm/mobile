import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { CipherApi } from "../../services/api/cipher-api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const CipherStoreModel = types
  .model("CipherStore")
  .props({
    token: types.maybeNull(types.string)
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    // ----------------- TOKEN -------------------

    saveToken: async (token: string) => {
      self.token = token
      self.environment.api.apisauce.setHeader('Authorization', `Bearer ${token}`)
    },

    clearToken: async () => {
      self.token = ''
      self.environment.api.apisauce.deleteHeader('Authorization')
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
    }
  }))

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
