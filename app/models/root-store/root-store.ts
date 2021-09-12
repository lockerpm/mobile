import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { UiStoreModel, UiStore } from "../ui-store/ui-store"
import { CipherStore, CipherStoreModel } from "../cipher-store/cipher-store"
import { CollectionStore, CollectionStoreModel } from "../collection-store/collection-store"
import { FolderStore, FolderStoreModel } from "../folder-store/folder-store"
import { UserModel, User } from "../user/user"

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore").props({
  uiStore: types.optional(UiStoreModel, {} as UiStore),
  user: types.optional(UserModel, {} as User),
  cipherStore: types.optional(CipherStoreModel, {} as CipherStore),
  folderStore: types.optional(FolderStoreModel, {} as FolderStore),
  collectionStore: types.optional(CollectionStoreModel, {} as CollectionStore)
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
