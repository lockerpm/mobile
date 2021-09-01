import { CollectionStoreModel } from "./collection-store"

test("can be created", () => {
  const instance = CollectionStoreModel.create({})

  expect(instance).toBeTruthy()
})
