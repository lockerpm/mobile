import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const SecureNoteVaultModel = types
  .model("SecureNoteVault")
  .props({
    type: types.integer,
    response: types.maybeNull(types.string)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecureNumber", "creditCardNumber"]))
 */

type SecureNoteVaultType = Instance<typeof SecureNoteVaultModel>
export interface SecureNoteVault extends SecureNoteVaultType {}
type SecureNoteVaultSnapshotType = SnapshotOut<typeof SecureNoteVaultModel>
export interface SecureNoteVaultSnapshot extends SecureNoteVaultSnapshotType {}
export const createSecureNoteVaultDefaultModel = () => types.optional(SecureNoteVaultModel, {})
