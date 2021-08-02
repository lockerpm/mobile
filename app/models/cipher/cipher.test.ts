import { CipherModel } from "./cipher"

test("can be created", () => {
  const instance = CipherModel.create({})

  expect(instance).toBeTruthy()
})
