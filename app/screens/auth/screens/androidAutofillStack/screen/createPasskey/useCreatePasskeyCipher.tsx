import { CipherType } from "core/enums"
import { CipherView, LoginUriView, LoginView } from "core/models/view"

import { useCipherData, useCipherHelper } from "@/services/hook"
import { CipherAppView } from "@/static/types"
import {
  AndroidAFCreatePasskey,
  AndroidASType,
  handleCreatePasskeyResponse,
  handlePasskeyError,
} from "@/utils/autofill.android"
import { createFido2SimpleView } from "@/utils/autofill.android/fido2"

export const useCreatePasskeyCipher = (props: AndroidAFCreatePasskey) => {
  const { newCipher } = useCipherHelper()
  const { createCipher, updateCipher } = useCipherData()
  const createNewCipher = async () => {
    try {
      const { publicKey, fido2View, clientExtensionResults } = await createFido2SimpleView(
        props.requestJson
      )

      const payload = newCipher(CipherType.Login)
      const data = new LoginView()
      data.username = fido2View.userName
      const uriView = new LoginUriView()
      uriView.uri = fido2View.rpId
      data.uris = [uriView]

      data.fido2Credentials = [fido2View]

      payload.name = fido2View.rpId
      payload.login = data

      await createCipher(payload, 5, [])

      await handleCreatePasskeyResponse(fido2View.credentialId, publicKey, clientExtensionResults)
    } catch (error) {
      await handlePasskeyError(AndroidASType.CREATE_PASSKEY, error)
    }
  }

  const addOrReplaceCipherFido2Credential = async (cipher: CipherAppView) => {
    try {
      const { publicKey, fido2View, clientExtensionResults } = await createFido2SimpleView(
        props.requestJson
      )

      // @ts-ignore
      const payload: CipherView = {
        ...cipher,
      }
      payload.login.fido2Credentials = [fido2View]
      await updateCipher(payload.id, payload, 5, payload.collectionIds || [])

      await handleCreatePasskeyResponse(fido2View.credentialId, publicKey, clientExtensionResults)
    } catch (error) {
      await handlePasskeyError(AndroidASType.CREATE_PASSKEY, error)
    }
  }

  return {
    createNewCipher,
    addOrReplaceCipherFido2Credential,
  }
}
