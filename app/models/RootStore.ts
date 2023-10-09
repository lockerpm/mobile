import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { CipherStoreModel } from "./cipherStore/CipherStore"
import { CollectionStoreModel } from "./collectionStore/CollectionStore"
import { EnterpriseStoreModel } from "./enterpriseStore/EnterpriseStore"
import { FolderStoreModel } from "./folderStore/FolderStore"
import { ToolStoreModel } from "./toolStore/ToolStore"
import { UiStoreModel } from "./uiStore/UiStore"
import { UserModel } from "./user/User"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  cipherStore: types.optional(CipherStoreModel, {} as any),
  collectionStore: types.optional(CollectionStoreModel, {} as any),
  enterpriseStore: types.optional(EnterpriseStoreModel, {} as any),
  folderStore: types.optional(FolderStoreModel, {} as any),
  toolStore: types.optional(ToolStoreModel, {} as any),
  uiStore: types.optional(UiStoreModel, {} as any),
  user: types.optional(UserModel, {} as any),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> { }
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> { }
