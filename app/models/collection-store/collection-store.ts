import { cast, Instance, SnapshotOut, types } from "mobx-state-tree"
import { omit } from "ramda"
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { CollectionRequest } from "../../../core/models/request/collectionRequest"
import { CollectionView } from "../../../core/models/view/collectionView"
import { AccountRoleText } from "../../config/types"
import { withEnvironment } from "../extensions/with-environment"
import { FolderApi } from "app/services/api/folder-api"
import { CollectionActionData } from "app/static/types"

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

  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    createCollection: async (teamId: string, data: CollectionRequest) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.postCollection(self.apiToken, teamId, data)
      return res
    },

    updateCollection: async (id: string, teamId: string, data: CollectionRequest) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.putCollection(self.apiToken, id, teamId, data)
      return res
    },

    deleteCollection: async (id: string, teamId: string, payload: CollectionActionData) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.deleteCollection(self.apiToken, id, teamId, payload)
      return res
    },

    stopShare: async (id: string, teamId: string, payload: CollectionActionData) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.stopShare(self.apiToken, id, teamId, payload)
      return res
    },

    removeShareMember: async (memberId: string, teamId: string, payload: CollectionActionData, isGroup?: boolean) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.removeShareMember(self.apiToken, memberId, teamId, payload, isGroup)
      return res
    },

    addShareMember: async (teamId: string, members: {
      username: string
      role: AccountRoleText
      key: string
      hide_passwords: boolean
    }[]) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.addShareMember(self.apiToken, teamId, members)
      return res
    },

    updateShareItem: async (id: string, teamId: string, payload: { cipher: CipherRequest & { id: string } }) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.updateShareItem(self.apiToken, id, teamId, payload)
      return res
    },

    removeShareItem: async (id: string, teamId: string, payload: { cipher: CipherRequest & { id: string } }) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.removeShareItem(self.apiToken, id, teamId, payload)
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
