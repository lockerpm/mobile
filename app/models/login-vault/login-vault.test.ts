import { LoginVaultModel } from "./login-vault"

test("can be created", () => {
  const instance = LoginVaultModel.create({})

  expect(instance).toBeTruthy()
})
