import { UserModel } from "./User"

test("can be created", () => {
  const instance = UserModel.create({})

  expect(instance).toBeTruthy()
})
