import { ToolStoreModel } from "./ToolStore"

test("can be created", () => {
  const instance = ToolStoreModel.create({})

  expect(instance).toBeTruthy()
})
