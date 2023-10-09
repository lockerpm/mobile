import { UiStoreModel } from "./UiStore"

test("can be created", () => {
  const instance = UiStoreModel.create({})

  expect(instance).toBeTruthy()
})
