import { PlanStoreModel } from "./plan-store"

test("can be created", () => {
  const instance = PlanStoreModel.create({})

  expect(instance).toBeTruthy()
})
