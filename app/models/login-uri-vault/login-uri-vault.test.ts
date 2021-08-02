import { LoginUriVaultModel } from "./login-uri-vault"

test("can be created", () => {
  const instance = LoginUriVaultModel.create({})

  expect(instance).toBeTruthy()
})
