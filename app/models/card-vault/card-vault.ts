import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const CardVaultModel = types
  .model("CardVault")
  .props({
    brand: types.maybeNull(types.string),
    cardholderName: types.maybeNull(types.string),
    code: types.maybeNull(types.string),
    expMonth: types.maybeNull(types.string),
    expYear: types.maybeNull(types.string),
    number: types.maybeNull(types.string),
    response: types.maybeNull(types.string)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type CardVaultType = Instance<typeof CardVaultModel>
export interface CardVault extends CardVaultType {}
type CardVaultSnapshotType = SnapshotOut<typeof CardVaultModel>
export interface CardVaultSnapshot extends CardVaultSnapshotType {}
export const createCardVaultDefaultModel = () => types.optional(CardVaultModel, {})
