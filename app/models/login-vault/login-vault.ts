import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { LoginUriVaultModel } from ".."

/**
 * Model description here for TypeScript hints.
 */
export const LoginVaultModel = types
  .model("LoginVault")
  .props({
    username: types.maybeNull(types.string),
    password: types.maybeNull(types.string),
    totp: types.maybeNull(types.string),
    response: types.maybeNull(types.string),
    uris: types.maybeNull(types.optional(types.array(LoginUriVaultModel), []))
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type LoginVaultType = Instance<typeof LoginVaultModel>
export interface LoginVault extends LoginVaultType {}
type LoginVaultSnapshotType = SnapshotOut<typeof LoginVaultModel>
export interface LoginVaultSnapshot extends LoginVaultSnapshotType {}
export const createLoginVaultDefaultModel = () => types.optional(LoginVaultModel, {})
