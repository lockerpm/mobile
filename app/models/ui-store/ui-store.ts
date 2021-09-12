import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const UiStoreModel = types
  .model("UiStore")
  .props({
    isOffline: types.maybeNull(types.boolean),
    showNetworkError: types.maybeNull(types.boolean),
    passwordChanged: types.maybeNull(types.boolean)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setIsOffline: (isOffline: boolean) => {
      self.isOffline = isOffline
    },
    setShowNetworkError: (value: boolean) => {
      self.showNetworkError = value
    },
    setPasswordChanged: (value: boolean) => {
      self.passwordChanged = value
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type UiStoreType = Instance<typeof UiStoreModel>
export interface UiStore extends UiStoreType {}
type UiStoreSnapshotType = SnapshotOut<typeof UiStoreModel>
export interface UiStoreSnapshot extends UiStoreSnapshotType {}
export const createUiStoreDefaultModel = () => types.optional(UiStoreModel, {})
