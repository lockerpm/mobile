import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const LoginUriVaultModel = types
  .model("LoginUriVault")
  .props({
    match: types.maybeNull(types.string),
    response: types.maybeNull(types.string),
    uri: types.maybeNull(types.string)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type LoginUriVaultType = Instance<typeof LoginUriVaultModel>
export interface LoginUriVault extends LoginUriVaultType {}
type LoginUriVaultSnapshotType = SnapshotOut<typeof LoginUriVaultModel>
export interface LoginUriVaultSnapshot extends LoginUriVaultSnapshotType {}
export const createLoginUriVaultDefaultModel = () => types.optional(LoginUriVaultModel, {})
