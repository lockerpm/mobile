import { Instance, SnapshotIn, SnapshotOut, cast, types } from 'mobx-state-tree'
import { withSetPropAction } from '../helpers/withSetPropAction'
import { CollectionView } from 'core/models/view/collectionView'
import { CollectionRequest } from 'core/models/request/collectionRequest'
import { folderApi } from 'app/services/api/folderApi'
import { CollectionActionData } from 'app/static/types'
import { AccountRoleText } from 'app/static/types/enum'
import { CipherRequest } from 'core/models/request/cipherRequest'
import { omit } from 'ramda'

/**
 * Model description here for TypeScript hints.
 */
export const CollectionStoreModel = types
  .model('CollectionStore')
  .props({
    apiToken: types.maybeNull(types.string),
    collections: types.array(types.frozen()),
    lastUpdate: types.maybeNull(types.number),
    notSynchedCollections: types.array(types.string), // Offline
    notUpdatedCollections: types.array(types.string), // Online but somehow not update
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setApiToken: (token: string) => {
      self.apiToken = token
    },

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
      self.lastUpdate = Date.now()
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
        self.notSynchedCollections = cast(self.notSynchedCollections.filter((i) => i !== id))
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
        self.notUpdatedCollections = cast(self.notUpdatedCollections.filter((i) => i !== id))
      }
    },

    clearNotUpdate: () => {
      self.notUpdatedCollections = cast([])
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    createCollection: async (teamId: string, data: CollectionRequest) => {
      const res = await folderApi.postCollection(self.apiToken, teamId, data)
      return res
    },

    updateCollection: async (id: string, teamId: string, data: CollectionRequest) => {
      const res = await folderApi.putCollection(self.apiToken, id, teamId, data)
      return res
    },

    deleteCollection: async (id: string, teamId: string, payload: CollectionActionData) => {
      const res = await folderApi.deleteCollection(self.apiToken, id, teamId, payload)
      return res
    },

    stopShare: async (id: string, teamId: string, payload: CollectionActionData) => {
      const res = await folderApi.stopShare(self.apiToken, id, teamId, payload)
      return res
    },

    removeShareMember: async (
      memberId: string,
      teamId: string,
      payload: CollectionActionData,
      isGroup?: boolean
    ) => {
      const res = await folderApi.removeShareMember(
        self.apiToken,
        memberId,
        teamId,
        payload,
        isGroup
      )
      return res
    },

    addShareMember: async (
      teamId: string,
      members: {
        username: string
        role: AccountRoleText
        key: string
        hide_passwords: boolean
      }[]
    ) => {
      const res = await folderApi.addShareMember(self.apiToken, teamId, members)
      return res
    },

    updateShareItem: async (
      id: string,
      teamId: string,
      payload: { cipher: CipherRequest & { id: string } }
    ) => {
      const res = await folderApi.updateShareItem(self.apiToken, id, teamId, payload)
      return res
    },

    removeShareItem: async (
      id: string,
      teamId: string,
      payload: { cipher: CipherRequest & { id: string } }
    ) => {
      const res = await folderApi.removeShareItem(self.apiToken, id, teamId, payload)
      return res
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .postProcessSnapshot(omit(['collections']))

export interface CollectionStore extends Instance<typeof CollectionStoreModel> {}
export interface CollectionStoreSnapshotOut extends SnapshotOut<typeof CollectionStoreModel> {}
export interface CollectionStoreSnapshotIn extends SnapshotIn<typeof CollectionStoreModel> {}
export const createCollectionStoreDefaultModel = () => types.optional(CollectionStoreModel, {})
