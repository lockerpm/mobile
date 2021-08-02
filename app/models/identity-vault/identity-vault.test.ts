import { IdentityVaultModel } from "./identity-vault"

test("can be created", () => {
  const instance = IdentityVaultModel.create({})

  expect(instance).toBeTruthy()
})
