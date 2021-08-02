import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { LoginVaultModel, SecureNoteVaultModel, CardVaultModel, IdentityVaultModel } from ".."

/**
 * Model description here for TypeScript hints.
 */
export const CipherModel = types
  .model("Cipher")
  .props({
    collectionIds: types.maybeNull(types.optional(types.array(types.string), [])),
    organizationId: types.maybeNull(types.string),
    folderId: types.maybeNull(types.string),
    favorite: types.boolean,
    fields: types.model('CipherField', {
      name: types.string,
      response: types.maybeNull(types.string),
      types: types.integer,
      value: types.string
    }),
    score: types.optional(types.number, 0),
    name: types.string,
    notes: types.maybeNull(types.string),
    type: types.integer,
    login: types.maybeNull(LoginVaultModel),
    secureNote: types.maybeNull(SecureNoteVaultModel),
    card: types.maybeNull(CardVaultModel),
    identity: types.maybeNull(IdentityVaultModel)
  })
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type CipherType = Instance<typeof CipherModel>
export interface Cipher extends CipherType {}
type CipherSnapshotType = SnapshotOut<typeof CipherModel>
export interface CipherSnapshot extends CipherSnapshotType {}
export const createCipherDefaultModel = () => types.optional(CipherModel, {})
