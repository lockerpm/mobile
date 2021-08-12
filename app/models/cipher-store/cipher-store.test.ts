import { CipherStoreModel } from "./cipher-store"

test("can be created", () => {
  const instance = CipherStoreModel.create({})

  expect(instance).toBeTruthy()
})
