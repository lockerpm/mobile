import { UiStoreModel } from "./ui-store"

test("can be created", () => {
  const instance = UiStoreModel.create({})

  expect(instance).toBeTruthy()
})
