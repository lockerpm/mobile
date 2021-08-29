import { cast, Instance, SnapshotOut, types } from "mobx-state-tree"
import { omit } from "ramda"
import { CollectionView } from "../../../core/models/view/collectionView"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const CollectionStoreModel = types
  .model("CollectionStore")
  .props({
    token: types.maybeNull(types.string),
    collections: types.array(types.frozen())
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
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

    // ----------------- DATA -------------------

    setCollections: (collections: CollectionView[]) => {
      self.collections = cast(collections)
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .postProcessSnapshot(omit(['collections']))

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type CollectionStoreType = Instance<typeof CollectionStoreModel>
export interface CollectionStore extends CollectionStoreType {}
type CollectionStoreSnapshotType = SnapshotOut<typeof CollectionStoreModel>
export interface CollectionStoreSnapshot extends CollectionStoreSnapshotType {}
export const createCollectionStoreDefaultModel = () => types.optional(CollectionStoreModel, {})
