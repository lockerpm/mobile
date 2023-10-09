import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { folderApi } from "app/services/api/folderApi"
import { FolderView } from "core/models/view/folderView"
import { FolderRequest } from "core/models/request/folderRequest"
import { ShareFolderData } from "app/static/types"

/**
 * Model description here for TypeScript hints.
 */
export const FolderStoreModel = types
  .model("FolderStore")
  .props({
    apiToken: types.maybeNull(types.string),
    folders: types.array(types.frozen()),
    lastUpdate: types.maybeNull(types.number),
    notSynchedFolders: types.array(types.string),   // Create in offline mode
    notUpdatedFolders: types.array(types.string),   // Create in online mode but somehow not update yet
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setApiToken: (token: string) => {
      self.apiToken = token
    },

    // ----------------- DATA -------------------

    setFolders: (folders: FolderView[]) => {
      self.folders = cast(folders)
    },

    setLastUpdate: () => {
      self.lastUpdate = Date.now()
    },

    clearStore: (dataOnly?: boolean) => {
      if (!dataOnly) {
        self.apiToken = null
      }
      self.folders = cast([])
      self.lastUpdate = null
      self.notSynchedFolders = cast([])
      self.notUpdatedFolders = cast([])
    },

    lock: () => {
      self.folders = cast([])
    },

    addNotSync: (id: string) => {
      if (!self.notSynchedFolders.includes(id)) {
        self.notSynchedFolders.push(id)
      }
    },

    removeNotSync: (id: string) => {
      if (!self.notSynchedFolders.includes(id)) {
        self.notSynchedFolders = cast(self.notSynchedFolders.filter(i => i !== id))
      }
    },

    clearNotSync: () => {
      self.notSynchedFolders = cast([])
    },

    addNotUpdate: (id: string) => {
      if (!self.notUpdatedFolders.includes(id)) {
        self.notUpdatedFolders.push(id)
      }
    },

    removeNotUpdate: (id: string) => {
      if (self.notUpdatedFolders.includes(id)) {
        self.notUpdatedFolders = cast(self.notUpdatedFolders.filter(i => i !== id))
      }
    },

    clearNotUpdate: () => {
      self.notUpdatedFolders = cast([])
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    getFolder: async (id: string) => {
      const res = await folderApi.getFolder(self.apiToken, id)
      return res
    },

    createFolder: async (data: FolderRequest) => {
      const res = await folderApi.postFolder(self.apiToken, data)
      return res
    },

    updateFolder: async (id: string, data: FolderRequest) => {
      const res = await folderApi.putFolder(self.apiToken, id, data)
      return res
    },

    deleteFolder: async (id: string) => {
      const res = await folderApi.deleteFolder(self.apiToken, id)
      return res
    },
    shareFolder: async (payload: ShareFolderData) => {
      const res = await folderApi.shareFolder(self.apiToken, payload)
      return res
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface FolderStore extends Instance<typeof FolderStoreModel> { }
export interface FolderStoreSnapshotOut extends SnapshotOut<typeof FolderStoreModel> { }
export interface FolderStoreSnapshotIn extends SnapshotIn<typeof FolderStoreModel> { }
export const createFolderStoreDefaultModel = () => types.optional(FolderStoreModel, {})
