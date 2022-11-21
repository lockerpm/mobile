import { EnterpriseModel } from "./enterprise"

test("can be created", () => {
  const instance = EnterpriseModel.create({})

  expect(instance).toBeTruthy()
})
