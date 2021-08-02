import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const IdentityVaultModel = types
  .model("IdentityVault")
  .props({
    address1: types.maybeNull(types.string),
    address2: types.maybeNull(types.string),
    address3: types.maybeNull(types.string),
    city: types.maybeNull(types.string),
    company: types.maybeNull(types.string),
    country: types.maybeNull(types.string),
    email: types.maybeNull(types.string),
    firstName: types.maybeNull(types.string),
    middleName: types.maybeNull(types.string),
    lastName: types.maybeNull(types.string),
    licenseNumber: types.maybeNull(types.string),
    postalCode: types.maybeNull(types.string),
    phone: types.maybeNull(types.string),
    passportNumber: types.maybeNull(types.string),
    response: types.maybeNull(types.string),
    ssn: types.maybeNull(types.string),
    state: types.maybeNull(types.string),
    title: types.maybeNull(types.string),
    username: types.maybeNull(types.string)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type IdentityVaultType = Instance<typeof IdentityVaultModel>
export interface IdentityVault extends IdentityVaultType {}
type IdentityVaultSnapshotType = SnapshotOut<typeof IdentityVaultModel>
export interface IdentityVaultSnapshot extends IdentityVaultSnapshotType {}
export const createIdentityVaultDefaultModel = () => types.optional(IdentityVaultModel, {})
