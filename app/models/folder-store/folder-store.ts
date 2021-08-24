import { Instance, SnapshotOut, types, cast } from "mobx-state-tree"
import { omit } from "ramda"
import { FolderView } from "../../../core/models/view/folderView"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const FolderStoreModel = types
  .model("FolderStore")
  .props({
    token: types.maybeNull(types.string),
    folders: types.array(types.frozen())
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

    setFolders: (folders: FolderView[]) => {
      self.folders = cast(folders)
    }
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
