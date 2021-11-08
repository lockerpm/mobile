import { Instance, SnapshotOut, types, cast } from "mobx-state-tree"
import { omit } from "ramda"
import { FolderRequest } from "../../../core/models/request/folderRequest"
import { FolderView } from "../../../core/models/view/folderView"
import { FolderApi } from "../../services/api/folder-api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const FolderStoreModel = types
  .model("FolderStore")
  .props({
    folders: types.array(types.frozen()),
    notSynchedFolders: types.array(types.string),
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    // ----------------- DATA -------------------

    setFolders: (folders: FolderView[]) => {
      self.folders = cast(folders)
    },

    clearStore: () => {
      self.folders = cast([])
      self.notSynchedFolders = cast([])
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

    // ----------------- CRUD -------------------

    createFolder: async (data: FolderRequest) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.postFolder(data)
      return res
    },

    updateFolder: async (id: string, data: FolderRequest) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.putFolder(id, data)
      return res
    },

    deleteFolder: async (id: string) => {
      const folderApi = new FolderApi(self.environment.api)
      const res = await folderApi.deleteFolder(id)
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
