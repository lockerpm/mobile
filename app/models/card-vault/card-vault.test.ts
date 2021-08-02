import { CardVaultModel } from "./card-vault"

test("can be created", () => {
  const instance = CardVaultModel.create({})

  expect(instance).toBeTruthy()
})
