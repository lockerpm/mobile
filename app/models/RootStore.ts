import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { createCipherStoreDefaultModel } from "./cipherStore/CipherStore"
import { createCollectionStoreDefaultModel } from "./collectionStore/CollectionStore"
import { createEnterpriseStoreDefaultModel } from "./enterpriseStore/EnterpriseStore"
import { createFolderStoreDefaultModel } from "./folderStore/FolderStore"
import { createToolStoreDefaultModel } from "./toolStore/ToolStore"
import { createUiStoreDefaultModel } from "./uiStore/UiStore"
import { createUserStoreDefaultModel } from "./user/User"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  cipherStore: createCipherStoreDefaultModel(),
  collectionStore: createCollectionStoreDefaultModel(),
  enterpriseStore: createEnterpriseStoreDefaultModel(),
  folderStore: createFolderStoreDefaultModel(),
  toolStore: createToolStoreDefaultModel(),
  uiStore: createUiStoreDefaultModel(),
  user: createUserStoreDefaultModel(),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
