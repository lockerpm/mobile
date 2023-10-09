import { EnterpriseStoreModel } from "./EnterpriseStore"

test("can be created", () => {
  const instance = EnterpriseStoreModel.create({})

  expect(instance).toBeTruthy()
})
