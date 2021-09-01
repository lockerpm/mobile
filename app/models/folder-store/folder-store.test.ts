import { FolderStoreModel } from "./folder-store"

test("can be created", () => {
  const instance = FolderStoreModel.create({})

  expect(instance).toBeTruthy()
})
