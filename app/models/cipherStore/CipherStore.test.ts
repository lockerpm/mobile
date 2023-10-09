import { CipherStoreModel } from "./CipherStore"

test("can be created", () => {
  const instance = CipherStoreModel.create({})

  expect(instance).toBeTruthy()
})
