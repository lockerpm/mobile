import { cast, Instance, SnapshotOut, types } from "mobx-state-tree"
import { omit } from "ramda"
import { CollectionRequest } from "../../../core/models/request/collectionRequest"
import { CollectionView } from "../../../core/models/view/collectionView"
import { AccountRoleText } from "../../config/types"
import { CollectionActionData } from "../../services/api"
import { CollectionApi } from "../../services/api/collection-api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const CollectionStoreModel = types
  .model("CollectionStore")
  .props({
    apiToken: types.maybeNull(types.string),
    collections: types.array(types.frozen()),
    lastUpdate: types.maybeNull(types.number),
    notSynchedCollections: types.array(types.string),   // Offline
    notUpdatedCollections: types.array(types.string)    // Online but somehow not update
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setApiToken: (token: string) => {
      self.apiToken = token
    },

    // ----------------- DATA -------------------

    setCollections: (collections: CollectionView[]) => {
      self.collections = cast(collections)
    },

    setLastUpdate: () => {
      self.lastUpdate = Date.now()
      self.lastUpdate = null
    },

    clearStore: (dataOnly?: boolean) => {
      if (!dataOnly) {
        self.apiToken = null
      }
      self.collections = cast([])
      self.notSynchedCollections = cast([])
      self.notUpdatedCollections = cast([])
    },

    lock: () => {
      self.collections = cast([])
    },

    addNotSync: (id: string) => {
      if (!self.notSynchedCollections.includes(id)) {
        self.notSynchedCollections.push(id)
      }
    },

    removeNotSync: (id: string) => {
      if (!self.notSynchedCollections.includes(id)) {
        self.notSynchedCollections = cast(self.notSynchedCollections.filter(i => i !== id))
      }
    },

    clearNotSync: () => {
      self.notSynchedCollections = cast([])
    },

    addNotUpdate: (id: string) => {
      if (!self.notUpdatedCollections.includes(id)) {
        self.notUpdatedCollections.push(id)
      }
    },

    removeNotUpdate: (id: string) => {
      if (self.notUpdatedCollections.includes(id)) {
        self.notUpdatedCollections = cast(self.notUpdatedCollections.filter(i => i !== id))
      }
    },

    clearNotUpdate: () => {
      self.notUpdatedCollections = cast([])
    },

    // ----------------- CRUD -------------------

    createCollection: async (teamId: string, data: CollectionRequest) => {
      const collectionApi = new CollectionApi(self.environment.api)
      const res = await collectionApi.postCollection(self.apiToken, teamId, data)
      return res
    },

    updateCollection: async (id: string, teamId: string, data: CollectionRequest) => {
      const collectionApi = new CollectionApi(self.environment.api)
      const res = await collectionApi.putCollection(self.apiToken, id, teamId, data)
      return res
    },

    deleteCollection: async (id: string, teamId: string, payload: CollectionActionData) => {
      const collectionApi = new CollectionApi(self.environment.api)
      const res = await collectionApi.deleteCollection(self.apiToken, id, teamId, payload)
      return res
    },

    stopShare: async (id: string, teamId: string, payload: CollectionActionData) => {
      const collectionApi = new CollectionApi(self.environment.api)
      const res = await collectionApi.stopShare(self.apiToken, id, teamId, payload)
      return res
    },

    addShareMember: async (teamId: string, members: {
      username: string
      role: AccountRoleText
      key: string
      hide_passwords: boolean
    }[]) => {
      const collectionApi = new CollectionApi(self.environment.api)
      const res = await collectionApi.addShareMember(self.apiToken, teamId, members)
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
export interface CollectionStore extends CollectionStoreType { }
type CollectionStoreSnapshotType = SnapshotOut<typeof CollectionStoreModel>
export interface CollectionStoreSnapshot extends CollectionStoreSnapshotType { }
export const createCollectionStoreDefaultModel = () => types.optional(CollectionStoreModel, {})
