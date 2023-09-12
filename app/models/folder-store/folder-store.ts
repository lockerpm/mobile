import { Instance, SnapshotOut, types, cast } from "mobx-state-tree"
import { omit } from "ramda"
import { FolderRequest } from "../../../core/models/request/folderRequest"
import { FolderView } from "../../../core/models/view/folderView"
import { ShareFolderData } from "app/static/types"
import { folderApi } from "app/services/api"

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

    // ----------------- CRUD -------------------

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
  }))
  .postProcessSnapshot(omit(['folders']))

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type FolderStoreType = Instance<typeof FolderStoreModel>
export interface FolderStore extends FolderStoreType {}
type FolderStoreSnapshotType = SnapshotOut<typeof FolderStoreModel>
export interface FolderStoreSnapshot extends FolderStoreSnapshotType {}
export const createFolderStoreDefaultModel = () => types.optional(FolderStoreModel, {})
