import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { CipherModel, Cipher } from "../cipher/cipher"
import { UserModel, User } from "../user/user"

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore").props({
  user: types.optional(UserModel, {} as User),
  cipher: types.optional(CipherModel, {} as Cipher)
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
