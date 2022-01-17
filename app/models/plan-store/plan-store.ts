import { Instance, SnapshotOut, types } from "mobx-state-tree"

import { withEnvironment } from "../extensions/with-environment"
import { PlanModel, PlanSnapshot, Plan } from "../plan/plan"
import { PaymentApi } from "../../services/api/payment-api"
import { GetPlanResult } from "../../services/api"
/**
 * Model description here for TypeScript hints.
 */
export const PlanStoreModel = types
  .model("PlanStore")
  .props({
    plans: types.optional(types.array(PlanModel), [])
  })
  .extend(withEnvironment)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    savePlans: (planSnapshots: PlanSnapshot[]) => {
      const planModels: Plan[] = planSnapshots.map((c) => PlanModel.create(c))
      self.plans.replace(planModels);
    },
  }))
  .actions((self) => ({
    getPlans: async () => {
      const planApi = new PaymentApi(self.environment.api)
      const result: GetPlanResult = await planApi.getPlans()
      if (result.kind === "ok") {
        self.savePlans(result.data)
      } else {
        __DEV__ && console.tron.log(result.kind)
      }
    }
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type PlanStoreType = Instance<typeof PlanStoreModel>
export interface PlanStore extends PlanStoreType { }
type PlanStoreSnapshotType = SnapshotOut<typeof PlanStoreModel>
export interface PlanStoreSnapshot extends PlanStoreSnapshotType { }
export const createPlanStoreDefaultModel = () => types.optional(PlanStoreModel, {})
