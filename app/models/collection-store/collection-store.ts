import { cast, Instance, SnapshotOut, types } from "mobx-state-tree"
import { omit } from "ramda"
import { CollectionRequest } from "../../../core/models/request/collectionRequest"
import { CollectionView } from "../../../core/models/view/collectionView"
import { CollectionApi } from "../../services/api/collection-api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const CollectionStoreModel = types
  .model("CollectionStore")
  .props({
    collections: types.array(types.frozen())
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    // ----------------- DATA -------------------

    setCollections: (collections: CollectionView[]) => {
      self.collections = cast(collections)
    },

    // ----------------- CRUD -------------------

    createCollection: async (teamId: string, data: CollectionRequest) => {
      const collectionApi = new CollectionApi(self.environment.api)
      const res = await collectionApi.postCollection(teamId, data)
      return res
    },

    updateCollection: async (id: string, teamId: string, data: CollectionRequest) => {
      const collectionApi = new CollectionApi(self.environment.api)
      const res = await collectionApi.putCollection(id, teamId, data)
      return res
    },

    deleteCollection: async (id: string, teamId: string) => {
      const collectionApi = new CollectionApi(self.environment.api)
      const res = await collectionApi.deleteCollection(id, teamId)
      return res
    },
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
