import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"

import { folderApi } from "app/services/api/folderApi"
import { ShareFolderData } from "app/static/types"
import { FolderRequest } from "core/models/request/folderRequest"
import { FolderView } from "core/models/view/folderView"

import { withSetPropAction } from "../helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const FolderStoreModel = types
  .model("FolderStore")
  .props({
    apiToken: types.string,
    vaultToken: types.string,
    folders: types.array(types.frozen()),
    lastUpdate: types.number,
    notSynchedFolders: types.array(types.string), // Create in offline mode
    notUpdatedFolders: types.array(types.string), // Create in online mode but somehow not update yet
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setApiToken: (token: string) => {
      self.apiToken = token
    },
    setVaultToken: (token: string) => {
      self.vaultToken = token
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
        self.apiToken = ""
        self.vaultToken = ""
      }
      self.folders = cast([])
      self.lastUpdate = 0
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
        self.notSynchedFolders = cast(self.notSynchedFolders.filter((i) => i !== id))
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
        self.notUpdatedFolders = cast(self.notUpdatedFolders.filter((i) => i !== id))
      }
    },

    clearNotUpdate: () => {
      self.notUpdatedFolders = cast([])
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    getFolder: async (id: string) => {
      const res = await folderApi.getFolder(self.apiToken, self.vaultToken, id)
      return res
    },

    createFolder: async (data: FolderRequest) => {
      const res = await folderApi.postFolder(self.apiToken, self.vaultToken, data)
      return res
    },

    updateFolder: async (id: string, data: FolderRequest) => {
      const res = await folderApi.putFolder(self.apiToken, self.vaultToken, id, data)
      return res
    },

    deleteFolder: async (id: string) => {
      const res = await folderApi.deleteFolder(self.apiToken, self.vaultToken, id)
      return res
    },
    shareFolder: async (payload: ShareFolderData) => {
      const res = await folderApi.shareFolder(self.apiToken, self.vaultToken, payload)
      return res
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface FolderStore extends Instance<typeof FolderStoreModel> {}
export interface FolderStoreSnapshotOut extends SnapshotOut<typeof FolderStoreModel> {}
export interface FolderStoreSnapshotIn extends SnapshotIn<typeof FolderStoreModel> {}
export const createFolderStoreDefaultModel = () =>
  types.optional(FolderStoreModel, {
    apiToken: "",
    vaultToken: "",
    folders: [],
    lastUpdate: 0,
    notSynchedFolders: [], // Create in offline mode
    notUpdatedFolders: [], // Create in online mode but somehow not update yet
  })
