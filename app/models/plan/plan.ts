import { Instance, SnapshotOut, types } from "mobx-state-tree"
/**
 * Model description here for TypeScript hints.
 */
export const PlanModel = types
  .model("Plan")
  .props({
    id: types.number,
    name: types.string,
    alias: types.string,
    halfYearlyPrice: types.frozen({
      usd: types.number,
      vnd: types.number,
      duration: types.string
    }),
    price: types.frozen({
      usd: types.number,
      vnd: types.number,
      duration: types.string
    }),
    yearlyPrice: types.frozen({
      usd: types.number,
      vnd: types.number,
      duration: types.string
    })
  })
  .views((self) => ({
    // get planId() {
    //   return self.id;
    // }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({

  })) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type PlanType = Instance<typeof PlanModel>
export interface Plan extends PlanType {}
type PlanSnapshotType = SnapshotOut<typeof PlanModel>
export interface PlanSnapshot extends PlanSnapshotType {}
export const createPlanDefaultModel = () => types.optional(PlanModel, {})
