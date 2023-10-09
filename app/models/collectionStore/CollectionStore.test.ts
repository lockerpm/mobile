import { CollectionStoreModel } from "./CollectionStore"

test("can be created", () => {
  const instance = CollectionStoreModel.create({})

  expect(instance).toBeTruthy()
})
