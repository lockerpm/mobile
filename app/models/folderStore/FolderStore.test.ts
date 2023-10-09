import { FolderStoreModel } from "./FolderStore"

test("can be created", () => {
  const instance = FolderStoreModel.create({})

  expect(instance).toBeTruthy()
})
