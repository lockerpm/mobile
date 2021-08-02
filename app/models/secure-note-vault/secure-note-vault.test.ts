import { SecureNoteVaultModel } from "./secure-note-vault"

test("can be created", () => {
  const instance = SecureNoteVaultModel.create({})

  expect(instance).toBeTruthy()
})
