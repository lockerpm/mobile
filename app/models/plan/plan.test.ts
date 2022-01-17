import { PlanModel } from "./plan"

test("can be created", () => {
  const instance = PlanModel.create({})

  expect(instance).toBeTruthy()
})
